"""
Feedback Generator
Generates natural, teacher-like feedback explaining both phoneme accuracy and pronunciation quality
"""

import random

class FeedbackGenerator:
    def __init__(self):
        self.perfect_phrases = [
            "Excellent! Your pronunciation is spot-on.",
            "Perfect! You nailed it.",
            "Outstanding! Keep up the good work."
        ]
        
        self.good_phrases = [
            "Good job! Your pronunciation is clear.",
            "Well done! You're pronouncing this correctly.",
            "Great! Your pronunciation is accurate."
        ]
    
    def generate(self, phoneme_errors, stress_errors, score, word, phoneme_breakdown=None):
        """Generate feedback explaining both phoneme accuracy and pronunciation quality"""
        
        # Check for wrong word
        if any(e.get('type') == 'wrong_word' for e in phoneme_errors):
            error = phoneme_errors[0]
            detected = error.get('detected', 'unclear')
            return f"You said '{detected}' but the exercise is '{word}'. Please say '{word}' clearly."
        
        # Separate phoneme errors from quality errors
        phoneme_mismatches = [e for e in phoneme_errors if e.get('type') != 'pronunciation_quality']
        quality_issues = [e for e in phoneme_errors if e.get('type') == 'pronunciation_quality']
        
        # Perfect score (95+)
        if score >= 95:
            return random.choice(self.perfect_phrases)
        
        # Good score (85-94) - All phonemes correct but quality issues
        if score >= 85:
            if quality_issues:
                # Explain that phonemes are correct but quality needs work
                issue = quality_issues[0]
                phoneme = issue.get('expected', '')
                tip = issue.get('teaching_tip', '')
                return f"✓ All sounds correct! However, your '{phoneme}' pronunciation quality can improve. {tip} Score: {score}% (Target: 95%+)"
            elif phoneme_mismatches:
                error = phoneme_mismatches[0]
                return f"Good! Minor issue: {error.get('teaching_tip', 'Practice this sound.')}"
            else:
                return f"{random.choice(self.good_phrases)} Keep practicing to reach 95%+!"
        
        # Moderate score (70-84) - Some phoneme errors or quality issues
        if score >= 70:
            if phoneme_mismatches:
                # Phoneme mismatch is primary issue
                error = phoneme_mismatches[0]
                phoneme = error.get('expected', '')
                tip = error.get('teaching_tip', '')
                return f"Your '{phoneme}' sound needs work. {tip} Practice this sound slowly."
            elif quality_issues:
                # Quality issues without phoneme errors
                issues_text = ', '.join([f"'{e.get('expected', '')}'" for e in quality_issues[:2]])
                return f"✓ Phonemes correct, but pronunciation quality needs improvement for: {issues_text}. Focus on clarity, tongue position, and breath control."
            else:
                return "Good effort! Focus on clarity and precision."
        
        # Low score (<70) - Multiple issues
        if phoneme_mismatches:
            # Show primary phoneme error
            primary = phoneme_mismatches[0]
            phoneme = primary.get('expected', '')
            tip = primary.get('teaching_tip', '')
            
            if len(phoneme_mismatches) > 1:
                secondary = phoneme_mismatches[1]
                return f"Focus on these sounds: '{phoneme}' - {tip}. Also work on '{secondary.get('expected', '')}' - {secondary.get('teaching_tip', 'Practice slowly')}. Practice with the reference audio."
            else:
                return f"Your '{phoneme}' sound has significant issues. {tip} Practice this sound in isolation first, then in the full word."
        elif quality_issues:
            # Low score due to quality issues only
            return f"✓ You're saying the right sounds, but pronunciation quality is low ({score}%). Focus on: clear articulation, proper tongue position, correct breath control, and appropriate duration. Listen to reference audio carefully."
        else:
            return "Let's practice this together. Listen to the reference audio and try to match the pronunciation exactly."
