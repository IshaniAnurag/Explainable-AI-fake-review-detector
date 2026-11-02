#!/bin/bash
set -e

echo "=========================================================="
echo "   TrustLens XAI - Zero-Cost CloudShell Deployment        "
echo "=========================================================="

echo "[1/4] Building production React frontend bundle..."
cd frontend
npm install --silent
npm run build
cd ..

echo "[2/4] Building SAM serverless package..."
sam build

echo "[3/4] Deploying SAM stack to AWS..."
sam deploy \
  --stack-name trustlens-xai \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset

echo "[4/4] Uploading frontend to S3..."
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name trustlens-xai --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name trustlens-xai --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" --output text)
API_URL=$(aws cloudformation describe-stacks --stack-name trustlens-xai --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)

cd frontend
VITE_BACKEND_URL=$API_URL npm run build
aws s3 sync dist/ s3://$BUCKET_NAME --delete
cd ..

echo "=========================================================="
echo "             DEPLOYMENT COMPLETED SUCCESSFULLY!           "
echo "=========================================================="
echo "API Gateway URL : $API_URL"
echo "Live Web App    : $CLOUDFRONT_URL"
echo "Storage (DB)    : Amazon DynamoDB (On-Demand / 0.00 USD base)"
echo "=========================================================="
