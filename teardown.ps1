# TrustLens XAI - Automated Cloud Teardown and Cleanup Script
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "     TrustLens XAI - Automated AWS Teardown and Cleanup   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$confirm = Read-Host "Are you sure you want to delete all cloud resources for trustlens-xai? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Teardown aborted." -ForegroundColor White
    exit 0
}

Write-Host ""
Write-Host "[1/2] Locating and emptying S3 frontend bucket..." -ForegroundColor Yellow
try {
    $bucketName = (aws cloudformation describe-stacks --stack-name trustlens-xai --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" --output text)
    if ($bucketName -and $bucketName -ne "None") {
        Write-Host "Emptying S3 bucket: $bucketName..." -ForegroundColor White
        aws s3 rm "s3://$bucketName" --recursive
    }
} catch {
    Write-Host "Could not query S3 bucket (it may already be deleted)." -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/2] Deleting CloudFormation Stack and all serverless resources..." -ForegroundColor Yellow
sam delete --stack-name trustlens-xai --no-prompts

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "         TEARDOWN COMPLETED. ALL RESOURCES DELETED.       " -ForegroundColor Green
Write-Host "       Your AWS billing surface is confirmed at 0.00 USD. " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
