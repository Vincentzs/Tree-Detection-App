# 13-Korotu-T - Machine Learning

## Azure Deployment

The machine learning model is deployed with Azure Machine Learning Studio.

### Step 1: Register the Model

1. Register from local files.

2. Choose model type as 'Unspecified type'.

3. Upload the folder 'aiy_vision_classifier_plants'. 

### Step 2: Deploy the Model

1. Deploy as Real-time endpoint.

2. Create new endpoint and use key-based authentication.

3. Upload 'scoring.py' in the 'AzureMl' folder as scoring file and dependencies.

4. Choose 'tensorflow-2.8-cuda11:4' as enviornment.

5. Click 'Next' and finish the deployment process.

### Step 3: Consume the Model

1. After the endpoint is successfully deployed, you should be able to find the REST endpoint link and primary key in the consume tab.
