"""
Model module for loan fraud/approval detection.
Provides the binary classification neural network architecture and compilation.
"""

import logging
import tensorflow as tf
from tensorflow.keras import layers, models, metrics, optimizers

logger = logging.getLogger("fraud_detection")

def build_model(input_dim: int) -> models.Model:
    """
    Builds and compiles the binary classification Deep Neural Network.

    Architecture:
    - Input Layer (dimension matched to features)
    - Dense(128, activation="relu")
    - BatchNormalization()
    - Dropout(0.30)
    - Dense(64, activation="relu")
    - Dropout(0.20)
    - Dense(32, activation="relu")
    - Dense(1, activation="sigmoid")

    Compiled with:
    - Optimizer: Adam
    - Loss: Binary Crossentropy
    - Metrics: Accuracy, Precision, Recall, AUC

    Args:
        input_dim (int): Number of input features.

    Returns:
        models.Model: The compiled Keras model.
    """
    try:
        logger.info(f"Initializing Keras Sequential model with input dimension: {input_dim}")
        
        model = models.Sequential([
            # Input layer
            layers.Input(shape=(input_dim,)),
            
            # First Dense block
            layers.Dense(128, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.30),
            
            # Second Dense block
            layers.Dense(64, activation="relu"),
            layers.Dropout(0.20),
            
            # Third Dense block
            layers.Dense(32, activation="relu"),
            
            # Output layer (sigmoid for binary classification)
            layers.Dense(1, activation="sigmoid")
        ])
        
        logger.info("Compiling model with Adam optimizer, binary crossentropy, and requested metrics...")
        model.compile(
            optimizer=optimizers.Adam(),
            loss="binary_crossentropy",
            metrics=[
                "accuracy",
                metrics.Precision(name="precision"),
                metrics.Recall(name="recall"),
                metrics.AUC(name="auc")
            ]
        )
        
        logger.info("Model compiled successfully. Summary:")
        # We can write the summary to logger as well
        model.summary(print_fn=logger.info)
        
        return model
        
    except Exception as e:
        logger.error(f"Error occurred while building/compiling the model: {e}")
        raise e
