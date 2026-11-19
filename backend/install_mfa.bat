# Install Montreal Forced Aligner
# This is what your panel expects for phoneme-level evaluation

# Step 1: Install MFA
pip install montreal-forced-aligner

# Step 2: Download English acoustic model
mfa model download acoustic english_us_arpa

# Step 3: Download English dictionary
mfa model download dictionary english_us_arpa

# Step 4: Verify installation
mfa version
