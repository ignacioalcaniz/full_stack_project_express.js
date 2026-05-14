# AWS Production Notes - The Library

- Frontend: CloudFront + S3
- Backend: ECS Fargate + ECR
- Domain: Route53 / custom domain
- API: https://api.thelibrarystore.it.com
- Web: https://www.thelibrarystore.it.com
- Secrets: AWS Secrets Manager
- Logs: CloudWatch
- Redis: ElastiCache Serverless with TLS
- MongoDB Atlas: restricted to AWS NAT Gateway Elastic IP
- NAT Gateway EIP: 56.125.211.36/32
- Mercado Pago: Checkout Pro integrated. Account review pending due to Mercado Pago commercial suspension.
- Resend: transactional emails configured.
- CI/CD: GitHub Actions + ZAP Full Scan + Security Baseline + Dependabot.