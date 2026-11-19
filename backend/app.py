"""
Flask API for Pronunciation Evaluation
Uses Acoustic Analysis + Phoneme Comparison
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import logging
from services.acoustic_analyzer import AcousticAnalyzer
from services.cmu_dict_service import CMUDictService
from services.phoneme_comparator import PhonemeComparator
from services.feedback_generator import FeedbackGenerator
from services.tts_service import TTSService
from services.phoneme_acoustic_evaluator import PhonemeAcousticEvaluator

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

analyzer = AcousticAnalyzer()
cmu_dict = CMUDictService()
comparator = PhonemeComparator()
feedback_gen = FeedbackGenerator()
tts_service = TTSService()
acoustic_evaluator = PhonemeAcousticEvaluator()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Phoneme evaluation backend is running',
        'version': '1.0.0'
    })

@app.route('/api/evaluate', methods=['POST'])
def evaluate_pronunciation():
    logger.info("========== RECEIVED EVALUATION REQUEST ==========")
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        if 'text' not in request.form:
            return jsonify({'error': 'No text provided'}), 400
        
        audio_file = request.files['audio']
        text = request.form['text'].strip().lower()
        exercise_id = request.form.get('exercise_id', 'unknown')
        
        # Check if sentence (multiple words)
        words = text.split()
        is_sentence = len(words) > 1
        
        logger.info(f"Evaluating: '{text}' (exercise: {exercise_id}, type: {'sentence' if is_sentence else 'word'})")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
            audio_path = temp_audio.name
        
        # Debug: Check audio file
        import os
        file_size = os.path.getsize(audio_path)
        logger.info(f"Audio file saved: {audio_path} (size: {file_size} bytes)")
        
        # Try to read audio file - use librosa which handles all formats (WAV, AAC, WebM, M4A)
        try:
            import librosa
            audio_data, sample_rate = librosa.load(audio_path, sr=16000, mono=True)
            logger.info(f"Audio loaded: {len(audio_data)} samples at {sample_rate}Hz")
            if len(audio_data) == 0:
                logger.error("Audio file is empty!")
                return jsonify({
                    'success': True,
                    'score': 0,
                    'phoneme_errors': [],
                    'stress_errors': [],
                    'feedback': 'Audio file is empty. Please record again.',
                    'error': 'EMPTY_AUDIO'
                })
            # Re-save as proper 16kHz WAV for downstream processing
            import soundfile as sf
            sf.write(audio_path, audio_data, 16000)
            logger.info(f"Audio converted and saved as 16kHz WAV")
        except Exception as audio_error:
            logger.error(f"Cannot read audio file: {audio_error}")
            return jsonify({
                'success': True,
                'score': 0,
                'phoneme_errors': [],
                'stress_errors': [],
                'feedback': 'Invalid audio format. Please try recording again.',
                'error': 'INVALID_AUDIO_FORMAT'
            })
        
        try:
            # Get expected phonemes based on sentence vs word
            if is_sentence:
                expected_phonemes = []
                for word in words:
                    word_phonemes = cmu_dict.get_phonemes(word)
                    if not word_phonemes:
                        return jsonify({
                            'error': 'WORD_NOT_FOUND',
                            'message': f'Word "{word}" not found in dictionary'
                        }), 400
                    expected_phonemes.extend(word_phonemes)
            else:
                expected_phonemes = cmu_dict.get_phonemes(text)
                if not expected_phonemes:
                    return jsonify({
                        'error': 'WORD_NOT_FOUND',
                        'message': f'Word "{text}" not found in dictionary'
                    }), 400
            
            logger.info(f"Expected phonemes: {expected_phonemes}")
            
            # Analyze pronunciation with vocabulary context
            analysis_result = analyzer.analyze_pronunciation(audio_path, text)
            
            if not analysis_result:
                return jsonify({
                    'success': True,
                    'score': 0,
                    'phoneme_errors': [],
                    'stress_errors': [],
                    'feedback': 'Could not analyze audio. Please speak clearly.',
                    'error': 'NO_SPEECH_DETECTED'
                })
            
            detected_word = analysis_result['word']
            confidence = analysis_result['confidence']
            
            # For sentences, extract all words
            if is_sentence:
                detected_words = detected_word.split()
                logger.info(f"Detected sentence: '{detected_word}' (expected: '{text}')")
            else:
                detected_words = [detected_word]
                logger.info(f"Detected: '{detected_word}' (confidence: {confidence:.2f})")
            
            # Get phonemes for detected text
            if is_sentence:
                detected_phonemes = []
                for word in detected_words:
                    word_phonemes = cmu_dict.get_phonemes(word)
                    if word_phonemes:
                        detected_phonemes.extend(word_phonemes)
                
                expected_phonemes_list = []
                for word in words:
                    word_phonemes = cmu_dict.get_phonemes(word)
                    if word_phonemes:
                        expected_phonemes_list.extend(word_phonemes)
                expected_phonemes = expected_phonemes_list
            else:
                detected_phonemes = cmu_dict.get_phonemes(detected_word)
                expected_phonemes = cmu_dict.get_phonemes(text)
            
            if not detected_phonemes or not expected_phonemes:
                # Word not in dictionary - likely wrong or unclear
                return jsonify({
                    'success': True,
                    'score': 0,
                    'phoneme_errors': [{
                        'position': -1,
                        'expected': ' '.join(expected_phonemes),
                        'detected': detected_word,
                        'severity': 5,
                        'type': 'wrong_word',
                        'teaching_tip': f'Please say "{text}" clearly.'
                    }],
                    'stress_errors': [],
                    'feedback': f'I heard "{detected_word}" but expected "{text}". Please try again.',
                    'detected_phonemes': [],
                    'expected_phonemes': expected_phonemes,
                    'detected_word': detected_word,
                    'breakdown': {'phoneme_score': 0, 'stress_score': 0},
                    'algorithm_version': '4.0-acoustic-analysis'
                })
            
            logger.info(f"Detected phonemes: {detected_phonemes}")
            
            # ALWAYS run acoustic evaluation on detected phonemes
            logger.info(f"Running phoneme-level acoustic evaluation on {len(expected_phonemes)} phonemes...")
            logger.info(f"Expected: {expected_phonemes}")
            logger.info(f"Detected: {detected_phonemes}")
            
            acoustic_result = acoustic_evaluator.evaluate_pronunciation(
                audio_path,
                expected_phonemes,
                detected_phonemes
            )
            
            logger.info(f"Acoustic result: {acoustic_result}")
            acoustic_score = acoustic_result.get('score', 50)
            acoustic_errors = acoustic_result.get('errors', [])
            logger.info(f"Acoustic evaluation COMPLETE: score={acoustic_score}, errors={len(acoustic_errors)}")
            
            if acoustic_score > 90:
                logger.warning(f"WARNING: Acoustic score is suspiciously high ({acoustic_score}) - evaluator may not be working correctly")
            
            # Also run phoneme comparison
            phoneme_errors = comparator.compare(detected_phonemes, expected_phonemes, text)
            phoneme_score = comparator.calculate_score(phoneme_errors, len(expected_phonemes))
            
            # For sentences, calculate word-level accuracy for partial credit
            if is_sentence and phoneme_score == 0:
                # Compare word by word
                expected_words = text.split()
                detected_words_list = detected_word.split()
                
                correct_words = 0
                for i, exp_word in enumerate(expected_words):
                    if i < len(detected_words_list) and detected_words_list[i] == exp_word:
                        correct_words += 1
                
                word_accuracy = (correct_words / len(expected_words)) * 100
                
                # Give partial credit: word accuracy (50%) + acoustic (50%)
                partial_score = int(word_accuracy * 0.5 + acoustic_score * 0.5)
                
                logger.info(f"Sentence partial credit: {correct_words}/{len(expected_words)} words correct, word_accuracy={word_accuracy:.1f}%, acoustic={acoustic_score}, final={partial_score}")
                
                # Build phoneme breakdown
                phoneme_breakdown = []
                for i, exp_phoneme in enumerate(expected_phonemes):
                    det_phoneme = detected_phonemes[i] if i < len(detected_phonemes) else ''
                    is_correct = det_phoneme == exp_phoneme
                    
                    phoneme_breakdown.append({
                        'phoneme': exp_phoneme,
                        'detected': det_phoneme,
                        'severity': 0 if is_correct else 3,
                        'readable': exp_phoneme,
                        'isCorrect': is_correct,
                        'teaching_tip': '' if is_correct else f'Expected "{exp_phoneme}" but detected "{det_phoneme}"'
                    })
                
                feedback = f'You got {correct_words} out of {len(expected_words)} words correct. '
                if correct_words < len(expected_words):
                    wrong_words = [expected_words[i] for i in range(len(expected_words)) if i >= len(detected_words_list) or detected_words_list[i] != expected_words[i]]
                    feedback += f'Focus on: {", ".join(wrong_words[:3])}'
                
                os.unlink(audio_path)
                return jsonify({
                    'success': True,
                    'score': partial_score,
                    'phoneme_errors': phoneme_errors,
                    'phoneme_breakdown': phoneme_breakdown,
                    'stress_errors': [],
                    'feedback': feedback,
                    'detected_phonemes': detected_phonemes,
                    'expected_phonemes': expected_phonemes,
                    'detected_word': detected_word,
                    'confidence': confidence,
                    'breakdown': {'phoneme_score': 0, 'quality_score': acoustic_score, 'word_accuracy': word_accuracy},
                    'algorithm_version': '5.1-partial-credit'
                })
            
            # Single word completely wrong - still give 0
            if phoneme_score == 0:
                phoneme_breakdown = []
                for i, exp_phoneme in enumerate(expected_phonemes):
                    phoneme_breakdown.append({
                        'phoneme': exp_phoneme,
                        'detected': '',
                        'severity': 5,
                        'readable': exp_phoneme,
                        'isCorrect': False,
                        'teaching_tip': f'You said "{detected_word}" instead of "{text}". Focus on saying "{text}" clearly.'
                    })
                
                feedback = f'You said "{detected_word}" but expected "{text}". Please say "{text}" clearly.'
                os.unlink(audio_path)
                return jsonify({
                    'success': True,
                    'score': 0,
                    'phoneme_errors': phoneme_errors,
                    'phoneme_breakdown': phoneme_breakdown,
                    'stress_errors': [],
                    'feedback': feedback,
                    'detected_phonemes': detected_phonemes,
                    'expected_phonemes': expected_phonemes,
                    'detected_word': detected_word,
                    'confidence': confidence,
                    'breakdown': {'phoneme_score': 0, 'quality_score': 0},
                    'algorithm_version': '5.1-partial-credit'
                })
            
            # Calculate final score based on word correctness
            if detected_word.replace(' ', '') == text.replace(' ', ''):
                # Correct word: Acoustic score PRIMARY (90%), phoneme validation (10%)
                final_score = int(acoustic_score * 0.9 + phoneme_score * 0.1)
                logger.info(f"Correct word: acoustic={acoustic_score}, phoneme={phoneme_score}, final={final_score}")
            else:
                # Wrong word: Penalize but consider quality - phoneme (60%) + acoustic (40%)
                final_score = int(phoneme_score * 0.6 + acoustic_score * 0.4)
                logger.info(f"Wrong word: phoneme={phoneme_score}, acoustic={acoustic_score}, final={final_score}")
            
            # Combine errors
            all_errors = phoneme_errors + acoustic_errors
            
            # Build phoneme breakdown
            phoneme_breakdown = []
            for i, exp_phoneme in enumerate(expected_phonemes):
                det_phoneme = detected_phonemes[i] if i < len(detected_phonemes) else None
                
                # Find errors
                phoneme_error = next((e for e in phoneme_errors if e.get('position') == i), None)
                acoustic_error = next((e for e in acoustic_errors if e.get('position') == i), None)
                
                if phoneme_error:
                    severity = phoneme_error.get('severity', 4)
                    teaching_tip = phoneme_error.get('teaching_tip', '')
                elif acoustic_error:
                    severity = acoustic_error.get('severity', 2)
                    teaching_tip = acoustic_error.get('teaching_tip', '')
                elif det_phoneme == exp_phoneme:
                    severity = 0
                    teaching_tip = ''
                else:
                    severity = 1
                    teaching_tip = ''
                
                phoneme_breakdown.append({
                    'phoneme': exp_phoneme,
                    'detected': det_phoneme or exp_phoneme,
                    'severity': severity,
                    'readable': exp_phoneme,
                    'isCorrect': det_phoneme == exp_phoneme if det_phoneme else False,
                    'teaching_tip': teaching_tip
                })
            
            feedback = feedback_gen.generate(all_errors, [], final_score, text, phoneme_breakdown)
            
            os.unlink(audio_path)
            return jsonify({
                'success': True,
                'score': final_score,
                'phoneme_errors': all_errors[:5],
                'phoneme_breakdown': phoneme_breakdown,
                'stress_errors': [],
                'feedback': feedback,
                'detected_phonemes': detected_phonemes,
                'expected_phonemes': expected_phonemes,
                'detected_word': detected_word,
                'confidence': confidence,
                'breakdown': {'phoneme_score': phoneme_score, 'acoustic_score': acoustic_score},
                'algorithm_version': '5.1-partial-credit'
            })
            
        except Exception as e:
            if os.path.exists(audio_path):
                os.unlink(audio_path)
            raise e
            
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'EVALUATION_FAILED',
            'message': str(e)
        }), 500

@app.route('/api/phonemes/<word>', methods=['GET'])
def get_phonemes(word):
    try:
        phonemes = cmu_dict.get_phonemes(word.lower())
        if not phonemes:
            return jsonify({'error': 'Word not found'}), 404
        
        return jsonify({
            'word': word,
            'phonemes': phonemes,
            'readable': cmu_dict.get_readable_phonemes(phonemes)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts/<word>', methods=['GET'])
def generate_tts(word):
    """
    Generate TTS audio for a word at specified speed
    Query params: speed (slow/medium/normal)
    """
    logger.info(f"TTS request: word='{word}', speed={request.args.get('speed', 'normal')}")
    try:
        speed = request.args.get('speed', 'normal')
        if speed not in ['slow', 'medium', 'normal']:
            logger.error(f"Invalid speed: {speed}")
            return jsonify({'error': 'Invalid speed. Use: slow, medium, or normal'}), 400
        
        logger.info(f"Generating TTS audio for '{word}' at speed '{speed}'...")
        audio_path = tts_service.generate_audio(word, speed)
        
        if not audio_path:
            logger.error("TTS generation returned None")
            return jsonify({'error': 'TTS generation failed'}), 500
        
        if not os.path.exists(audio_path):
            logger.error(f"Generated audio file not found: {audio_path}")
            return jsonify({'error': 'Audio file not found'}), 404
        
        logger.info(f"Sending TTS audio: {audio_path}")
        response = send_file(audio_path, mimetype='audio/mpeg')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cache-Control'] = 'public, max-age=3600'
        return response
    except Exception as e:
        logger.error(f"TTS error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    
    logger.info("Starting Phoneme Evaluation Backend...")
    logger.info("Initializing services...")
    
    try:
        if not analyzer.initialize():
            logger.error("Acoustic analyzer initialization failed")
            exit(1)
        
        cmu_dict.load()
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Service initialization failed: {e}")
        exit(1)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
