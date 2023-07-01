import os
import base64
import json
import numpy as np
import pandas as pd
from PIL import Image
import tensorflow as tf
import io

def init():
    global model
    global class_df
    model_path = os.path.join(
        os.getenv("AZUREML_MODEL_DIR"), "aiy_vision_classifier_plants"
    )
    model = tf.saved_model.load(model_path)
    class_df_path = os.path.join(
        os.getenv("AZUREML_MODEL_DIR"), "aiy_vision_classifier_plants/aiy_plants_V1_labelmap.csv"
    )
    class_df = pd.read_csv(class_df_path)
    class_df = class_df.set_index("id")

def run(raw_data):
    print(raw_data)
    data = json.loads(raw_data)['data']
    print(data)
    img_bytes = base64.b64decode(data)
    img = Image.open(io.BytesIO(img_bytes))
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    infer = model.signatures["default"]
    output = infer(tf.constant(img_array, dtype=tf.float32))
    class_index = np.argmax(output['default'])
    class_name = class_df.loc[class_index]["name"]
    result = {"class_name": class_name}
    return json.dumps(result)