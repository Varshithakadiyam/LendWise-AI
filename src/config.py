import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Data File Paths
TRAIN_PATH = os.path.join(DATA_DIR, "train.csv")
TEST_PATH = os.path.join(DATA_DIR, "test.csv")
SAMPLE_SUBMISSION_PATH = os.path.join(DATA_DIR, "sample_submission.csv")

# Processed Data File Paths
PROCESSED_TRAIN_PATH = os.path.join(DATA_DIR, "train_processed.csv")
PROCESSED_TEST_PATH = os.path.join(DATA_DIR, "test_processed.csv")

# Preprocessor Serialization Path
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")

# Column Definitions
ID_COLUMN = "Loan_ID"
TARGET_COLUMN = "Loan_Status"

NUMERICAL_FEATURES = [
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term"
]

CATEGORICAL_FEATURES = [
    "Gender",
    "Married",
    "Dependents",
    "Education",
    "Self_Employed",
    "Credit_History",
    "Property_Area"
]

# Pipeline Settings
RANDOM_STATE = 42
TEST_SIZE = 0.2
