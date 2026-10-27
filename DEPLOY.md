# Zero-Cost AWS Deployment Guide (`DEPLOY.md`)

This guide walks you step-by-step through creating an **AWS Free Tier Account** with **$0.00 spend**, configuring your local environment, deploying the full serverless stack with one script, and tearing it down whenever you wish.

---

## Part 1: How to Create a 100% Free AWS Account

AWS provides an **Always Free** and **12-Month Free Tier** that covers all services used in this project:
- **AWS Lambda:** 1,000,000 free requests/month (Always Free)
- **Amazon DynamoDB:** 25 GB free storage (Always Free)
- **Amazon CloudFront:** 1 TB free data transfer/month (Always Free)
- **Amazon API Gateway:** 1,000,000 HTTP API calls/month (12 Months Free)
- **Amazon S3:** 5 GB free storage (12 Months Free)

### Step-by-Step Account Setup:

1. **Go to AWS Free Tier Signup:**  
   Open your browser and navigate to: 👉 [https://aws.amazon.com/free/](https://aws.amazon.com/free/)  
   Click the orange button: **"Create an AWS Account"**.

2. **Root User Credentials:**
   - Enter your **Email Address** and an **Account Name** (e.g., `trustlens-cloud-project`).
   - Click **Verify email address** and enter the 6-digit code sent to your inbox.
   - Choose a strong root password.

3. **Contact Information:**
   - Select **Personal** (not Business).
   - Fill in your Full Name, Phone Number, and Address.
   - Check the AWS Customer Agreement box and continue.

4. **Billing / Payment Verification (Zero-Cost Note):**
   - Enter your Credit Card or Debit Card details (Visa, MasterCard, Amex, or RuPay with international transactions enabled).
   - **Why does AWS ask for a card?** To verify identity and prevent spam bots.
   - **Will you be charged?** AWS will make a temporary authorization hold of **$1.00 USD (or ~₹2 INR in India)**. This amount is **automatically refunded** within 3–5 business days. You will NOT be charged for using the free tier services.

5. **Confirm Identity:**
   - Select **Text message (SMS)**, enter your mobile number, and submit the 4-digit verification code.

6. **Select Support Plan (CRITICAL FOR ZERO COST):**
   - Choose: **Basic Support - Free** ($0/month).
   - *Do NOT select Developer ($29/mo) or Business ($100/mo).*

7. **Complete Signup:**
   - Click **Complete sign up**. Your account will be activated within 2 to 5 minutes.

---

## Part 2: Security & Budget Guardrail (The $0.01 Alarm)

Once logged into the **AWS Management Console**:

1. In the search bar at the top, type **Budgets** and click **AWS Budgets**.
2. Click **Create budget**.
3. Choose **Zero spend budget** (or Cost budget with a limit of **$0.01**).
4. Enter your email address to receive an alert if your usage ever exceeds 1 cent.
5. Click **Create budget**. This guarantees you will immediately be notified if any billable resource is ever created.

---

## Part 3: Create Access Keys (IAM)

To allow the automated deployment script to create resources from your computer:

1. In the AWS console search bar, type **IAM** and select **IAM (Identity and Access Management)**.
2. In the left navigation menu, click **Users** $\rightarrow$ **Create user**.
3. Set Username: `deployer-admin`. Click **Next**.
4. Under Permissions options, select **Attach policies directly**.
5. Search for and check: **`AdministratorAccess`**. Click **Next** $\rightarrow$ **Create user**.
6. Click on your newly created user (`deployer-admin`).
7. Click the **Security credentials** tab.
8. Scroll down to **Access keys** $\rightarrow$ click **Create access key**.
9. Select **Command Line Interface (CLI)**, check the confirmation box, and click **Next** $\rightarrow$ **Create access key**.
10. **Copy your `Access Key ID` and `Secret Access Key`** (or download the `.csv` file). Keep this tab open.

---

## Part 4: Install AWS CLI & SAM CLI

Open PowerShell as Administrator (or standard PowerShell in VS Code) and run:

```powershell
winget install Amazon.AWSCLI
winget install Amazon.SAM-CLI
```

*Restart your VS Code terminal after installation so the tools appear on your PATH.*

Verify both tools are available:
```powershell
aws --version
sam --version
```

---

## Part 5: Configure Local Credentials

In your VS Code terminal, run:

```powershell
aws configure
```

Enter your details when prompted:
- **AWS Access Key ID:** *(Paste your access key from Step 3)*
- **AWS Secret Access Key:** *(Paste your secret key from Step 3)*
- **Default region name:** `us-east-1` *(or `ap-south-1` for Mumbai)*
- **Default output format:** `json`

---

## Part 6: Deploy with One Command!

In your VS Code terminal in the project root:

```powershell
.\deploy.ps1
```

### What `deploy.ps1` Does Automatically:
1. Compiles the React frontend production bundle with `npm run build`.
2. Packages the FastAPI application and ML model using `sam build`.
3. Provisions the AWS Lambda function, API Gateway v2, DynamoDB table, S3 bucket, and CloudFront CDN.
4. Uploads the built frontend assets directly to S3.
5. Prints your live, public CloudFront URL:
   ```text
   ==========================================================
                DEPLOYMENT COMPLETED SUCCESSFULLY!           
   ==========================================================
   API Gateway URL : https://abc123xyz.execute-api.us-east-1.amazonaws.com
   Live Web App    : https://d111111abcdef8.cloudfront.net
   Storage (DB)    : Amazon DynamoDB (On-Demand / $0.00 base)
   ==========================================================
   ```

Open the **Live Web App** URL in your browser on your computer or phone!

---

## Part 7: Teardown & Cleanup (Zero-Spend Guarantee)

Whenever you are done demonstrating the project or after your college review:

Run the automated teardown script:
```powershell
.\teardown.ps1
```

Type `y` when prompted. This automatically:
1. Empties all files from the S3 bucket.
2. Deletes the CloudFormation stack and all cloud resources (Lambda, DynamoDB, API Gateway, CloudFront).
3. Leaves your AWS account completely empty with **$0.00** billed.
