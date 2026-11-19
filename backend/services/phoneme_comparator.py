"""
Phoneme Comparator
Compares detected phonemes with expected phonemes
Identifies specific errors with teaching tips
"""

class PhonemeComparator:
    def __init__(self):
        # Common Indian English pronunciation errors with SPECIFIC teaching
        self.error_patterns = {
            ('AA', 'AE'): {
                'type': 'vowel_substitution',
                'severity': 4,
                'tip': 'You said "AE" (as in "hat") instead of "AA" (as in "hot"). Drop your jaw FULLY and say "ahhh" like at the doctor. Your mouth should be wide open.',
                'practice': 'Practice words: hot, pot, lot, dot, got'
            },
            ('AE', 'AA'): {
                'type': 'vowel_substitution',
                'severity': 4,
                'tip': 'You said "AA" (as in "hot") instead of "AE" (as in "hat"). Stretch your mouth WIDE like a big smile while saying "a". Your lips should be pulled back.',
                'practice': 'Practice words: hat, cat, bat, mat, sat'
            },
            ('TH', 'T'): {
                'type': 'substitution',
                'severity': 4,
                'tip': 'You said "T" instead of "TH". Place your tongue TIP between your teeth (stick it out slightly) and blow air gently. You should feel air on your tongue.',
                'practice': 'Practice words: think, thank, three, throw, thumb'
            },
            ('TH', 'D'): {
                'type': 'substitution',
                'severity': 4,
                'tip': 'You said "D" instead of "TH". Put your tongue between your teeth, NOT behind them. The tongue should touch your teeth lightly.',
                'practice': 'Practice words: this, that, these, those, them'
            },
            ('DH', 'D'): {
                'type': 'substitution',
                'severity': 4,
                'tip': 'You said "D" instead of "DH". Place tongue between teeth and VIBRATE your vocal cords. It should sound buzzy, not sharp.',
                'practice': 'Practice words: the, this, that, there, they'
            },
            ('V', 'W'): {
                'type': 'substitution',
                'severity': 4,
                'tip': 'You said "W" instead of "V". Touch your UPPER teeth to your LOWER lip and vibrate. Do NOT round your lips like "W".',
                'practice': 'Practice words: very, voice, video, visit, value'
            },
            ('W', 'V'): {
                'type': 'substitution',
                'severity': 3,
                'tip': 'You said "V" instead of "W". ROUND your lips (like kissing) and blow air. Do NOT touch teeth to lip.',
                'practice': 'Practice words: water, we, will, way, word'
            },
            ('AE', 'EH'): {
                'type': 'vowel_error',
                'severity': 3,
                'tip': 'You said "EH" (as in "bed") instead of "AE" (as in "cat"). Open your mouth WIDER and pull lips back more.',
                'practice': 'Practice words: cat, bad, man, hand, stand'
            },
            ('AA', 'AH'): {
                'type': 'vowel_error',
                'severity': 3,
                'tip': 'You said "AH" (as in "cup") instead of "AA" (as in "hot"). Drop your jaw MORE and open mouth FULLY.',
                'practice': 'Practice words: hot, stop, shop, top, drop'
            },
            ('IH', 'IY'): {
                'type': 'vowel_error',
                'severity': 3,
                'tip': 'You said "IY" (as in "see") instead of "IH" (as in "sit"). Relax your mouth more, don\'t stretch lips.',
                'practice': 'Practice words: sit, bit, hit, fit, kit'
            },
            ('IY', 'IH'): {
                'type': 'vowel_error',
                'severity': 3,
                'tip': 'You said "IH" (as in "sit") instead of "IY" (as in "see"). Stretch your lips WIDE and hold the sound LONGER.',
                'practice': 'Practice words: see, tree, free, three, key'
            },
            ('R', 'L'): {
                'type': 'consonant_confusion',
                'severity': 4,
                'tip': 'You said "L" instead of "R". For "R", CURL your tongue back without touching the roof. For "L", touch tongue TIP to roof.',
                'practice': 'Practice words: red, right, run, road, rice'
            },
            ('L', 'R'): {
                'type': 'consonant_confusion',
                'severity': 4,
                'tip': 'You said "R" instead of "L". For "L", touch your tongue TIP firmly to the roof of mouth behind teeth.',
                'practice': 'Practice words: light, love, like, look, long'
            }
        }
    
    def compare(self, detected, expected, word):
        """
        Compare detected vs expected phonemes
        Returns list of errors with matching phonemes marked
        """
        errors = []
        
        # Handle length mismatch
        if len(detected) != len(expected):
            if abs(len(detected) - len(expected)) > 2:
                errors.append({
                    'position': -1,
                    'expected': ' '.join(expected),
                    'detected': ' '.join(detected),
                    'severity': 5,
                    'type': 'wrong_word',
                    'teaching_tip': f'You said a different word. Please say "{word}" clearly.',
                    'readableLabel': 'Wrong Word'
                })
                return errors
        
        # Compare phoneme by phoneme
        max_len = max(len(detected), len(expected))
        for i in range(max_len):
            det = detected[i] if i < len(detected) else None
            exp = expected[i] if i < len(expected) else None
            
            if det and exp and det != exp:
                error_key = (exp, det)
                error_info = self.error_patterns.get(error_key, {
                    'type': 'mismatch',
                    'severity': 3,
                    'tip': f'You said "{det}" instead of "{exp}". Listen to the reference audio carefully.',
                    'practice': f'Practice the "{exp}" sound slowly'
                })
                
                errors.append({
                    'position': i,
                    'expected': exp,
                    'detected': det,
                    'severity': error_info['severity'],
                    'type': error_info['type'],
                    'teaching_tip': error_info['tip'],
                    'practice_words': error_info.get('practice', ''),
                    'readableLabel': exp
                })
            elif det and not exp:
                errors.append({
                    'position': i,
                    'expected': '',
                    'detected': det,
                    'severity': 3,
                    'type': 'extra_phoneme',
                    'teaching_tip': f'Extra sound detected. Keep it shorter.',
                    'readableLabel': det
                })
            elif exp and not det:
                errors.append({
                    'position': i,
                    'expected': exp,
                    'detected': '',
                    'severity': 4,
                    'type': 'missing_phoneme',
                    'teaching_tip': f'Missing "{exp}" sound. Make sure to pronounce it.',
                    'readableLabel': exp
                })
        
        errors.sort(key=lambda x: x['severity'], reverse=True)
        return errors
    
    def calculate_score(self, errors, total_phonemes):
        """Calculate score: 100 - (wrong_phonemes / total * 100)"""
        if not errors:
            return 100
        
        if any(e['type'] == 'wrong_word' for e in errors):
            return 0
        
        # Simple formula: percentage of correct phonemes
        wrong_count = len([e for e in errors if e.get('type') != 'pronunciation_quality'])
        correct_count = total_phonemes - wrong_count
        
        if correct_count <= 0:
            return 0
        
        score = int((correct_count / total_phonemes) * 100)
        return max(0, min(100, score))
