import os
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Import config and utils
from config import (
    TRAIN_PATH,
    TEST_PATH,
    PROCESSED_TRAIN_PATH,
    PROCESSED_TEST_PATH,
    PREPROCESSOR_PATH,
    ID_COLUMN,
    TARGET_COLUMN,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)
from utils import setup_logging, save_object

logger = setup_logging()

def load_datasets():
    """
    Loads raw train and test datasets.
    """
    logger.info(f"Loading train dataset from {TRAIN_PATH}")
    train_df = pd.read_csv(TRAIN_PATH)
    logger.info(f"Loading test dataset from {TEST_PATH}")
    test_df = pd.read_csv(TEST_PATH)
    return train_df, test_df

def build_preprocessor():
    """
    Builds the scikit-learn ColumnTransformer for preprocessing.
    - Numerical: Median imputation + Standard Scaling
    - Categorical: Most Frequent imputation + One-Hot Encoding
    """
    logger.info("Building preprocessing pipeline...")
    
    # Numerical Pipeline
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical Pipeline
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Combined Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'  # drop any other columns (e.g. Loan_ID)
    )
    
    # Configure to output pandas DataFrames (sklearn 1.2+)
    preprocessor.set_output(transform="pandas")
    
    return preprocessor

def preprocess():
    """
    Main function to execute the preprocessing steps:
    1. Load data
    2. Extract targets
    3. Build and fit preprocessor
    4. Save preprocessor and processed datasets
    """
    # 1. Load data
    train_df, test_df = load_datasets()
    
    # Extract target y and ID columns
    y_train = train_df[TARGET_COLUMN].map({'Y': 1, 'N': 0})
    
    train_ids = train_df[ID_COLUMN]
    test_ids = test_df[ID_COLUMN]
    
    # Separate features
    X_train = train_df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    X_test = test_df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    
    logger.info(f"Train features shape: {X_train.shape}")
    logger.info(f"Test features shape: {X_test.shape}")
    
    # 2. Build preprocessor
    preprocessor = build_preprocessor()
    
    # 3. Fit on train features and transform both
    logger.info("Fitting and transforming train features...")
    X_train_processed = preprocessor.fit_transform(X_train)
    
    logger.info("Transforming test features...")
    X_test_processed = preprocessor.transform(X_test)
    
    # 4. Reconstruct processed DataFrames
    # We include the ID_COLUMN as a feature/identifier
    X_train_processed.insert(0, ID_COLUMN, train_ids.values)
    X_train_processed[TARGET_COLUMN] = y_train.values
    
    X_test_processed.insert(0, ID_COLUMN, test_ids.values)
    
    logger.info(f"Processed Train Shape: {X_train_processed.shape}")
    logger.info(f"Processed Test Shape: {X_test_processed.shape}")
    
    # 5. Save outputs
    logger.info(f"Saving processed train data to {PROCESSED_TRAIN_PATH}")
    X_train_processed.to_csv(PROCESSED_TRAIN_PATH, index=False)
    
    logger.info(f"Saving processed test data to {PROCESSED_TEST_PATH}")
    X_test_processed.to_csv(PROCESSED_TEST_PATH, index=False)
    
    # Save the fitted preprocessor
    save_object(preprocessor, PREPROCESSOR_PATH)
    logger.info("Preprocessing step completed successfully!")

if __name__ == "__main__":
    preprocess()
