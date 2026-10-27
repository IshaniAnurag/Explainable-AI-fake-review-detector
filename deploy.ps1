# TrustLens XAI — Automated Zero-Cost Cloud Deployment Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TrustLens XAI — Zero-Cost AWS Serverless Deployment    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check prerequisites
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] AWS CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install it via: winget install Amazon.AWSCLI" -ForegroundColor Yellow
    exit 1
}

if (-not (Get-Command sam -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] AWS SAM CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install it via: winget install Amazon.SAM-CLI" -ForegroundColor Yellow
    exit 1
}

# 2. Build the React frontend
Write-Host "`n[1/4] Building production React frontend bundle..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location -Path "$PSScriptRoot"

# 3. Build AWS SAM Lambda package
Write-Host "`n[2/4] Building AWS SAM serverless package..." -ForegroundColor Green
sam build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] SAM build failed!" -ForegroundColor Red
    exit 1
}

# 4. Deploy SAM CloudFormation stack
Write-Host "`n[3/4] Deploying to AWS (Zero-Cost Free Tier)..." -ForegroundColor Green
sam deploy `
    --stack-name trustlens-xai `
    --resolve-s3 `
    --capabilities CAPABILITY_IAM `
    --no-confirm-changeset

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] SAM deployment failed!" -ForegroundColor Red
    exit 1
}

# 5. Extract Outputs (Bucket Name, CloudFront URL, API URL)
Write-Host "`n[4/4] Uploading frontend assets to S3 and invalidating CDN..." -ForegroundColor Green
$stackOutputs = aws cloudformation describe-stacks --stack-name trustlens-xai --query "Stacks[0].Outputs" --output json | ConvertFrom-Json

$bucketName = ($stackOutputs | Where-Object { $_.OutputKey -eq "S3BucketName" }).OutputValue
$cloudFrontUrl = ($stackOutputs | Where-Object { $_.OutputKey -eq "CloudFrontUrl" }).OutputValue
$apiUrl = ($stackOutputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue

# Re-build frontend with the actual deployed API URL
Set-Location -Path "$PSScriptRoot\frontend"
$env:VITE_BACKEND_URL = $apiUrl
npm run build
aws s3 sync dist/ "s3://$bucketName" --delete
Set-Location -Path "$PSScriptRoot"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "             DEPLOYMENT COMPLETED SUCCESSFULLY!           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "API Gateway URL : $apiUrl" -ForegroundColor White
Write-Host "Live Web App    : $cloudFrontUrl" -ForegroundColor Yellow
Write-Host "Storage (DB)    : Amazon DynamoDB (On-Demand / \$0.00 base)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Open the Live Web App in your browser to test!" -ForegroundColor Green
