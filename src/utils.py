import os
import logging
import joblib

def setup_logging(level=logging.INFO):
    """
    Sets up a premium, clean console logging format.
    """
    logging.basicConfig(
        level=level,
        format="[%(asctime)s] %(levelname)s [%(name)s:%(lineno)d] - %(message)s",
        datefmt="%H:%M:%S"
    )
    return logging.getLogger("fraud_detection")

def ensure_dir(path):
    """
    Ensures that the directory of the given file path exists.
    """
    directory = os.path.dirname(path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory, exist_ok=True)

def save_object(obj, path):
    """
    Saves a Python object using joblib.
    """
    ensure_dir(path)
    joblib.dump(obj, path)
    logger = logging.getLogger("fraud_detection")
    logger.info(f"Saved object to {path}")

def load_object(path):
    """
    Loads a Python object using joblib.
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"Object file not found at: {path}")
    obj = joblib.load(path)
    logger = logging.getLogger("fraud_detection")
    logger.info(f"Loaded object from {path}")
    return obj
