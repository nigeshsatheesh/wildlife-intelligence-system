# EcoGuard AWS Production Infrastructure & Monthly Cost Estimation

## Architecture Overview
The EcoGuard Wildlife Population Intelligence System is deployed on AWS using a decoupled, highly scalable serverless microservices architecture:
1. **Frontend**: Static React bundle hosted on S3 and distributed globally via Amazon CloudFront.
2. **Routing & Ingress**: Amazon Application Load Balancer (ALB) acting as the HTTPS ingress router.
3. **Backend Service**: Node.js/Express REST API running on AWS ECS Fargate (`0.5 vCPU`, `1 GB RAM`).
4. **ML Bioacoustic Service**: Python microservice running HuggingFace AST, Kaggle Perch 2.0, and YAMNet models on AWS ECS Fargate (`2 vCPU`, `4 GB RAM`).
5. **Database**: Managed MongoDB Atlas / AWS DocumentDB instance.

---

## AWS Monthly Cost Breakdown (us-east-1 Region)

| Infrastructure Component | Configuration / Specification | Estimated Monthly Cost (USD) |
| :--- | :--- | :--- |
| **Amazon CloudFront + S3** | Static web asset hosting, global CDN edge caching, 50 GB data transfer | **$3.50** |
| **Application Load Balancer (ALB)** | 1 ALB instance + 0.8 LCU average usage (routing rules to ECS target groups) | **$21.00** |
| **ECS Fargate (Backend API)** | 1 Task: 0.5 vCPU, 1.0 GB RAM ($0.04048/vCPU-hr + $0.004445/GB-hr) | **$16.50** |
| **ECS Fargate (ML Microservice)** | 1 Task: 2.0 vCPU, 4.0 GB RAM (Audio feature extraction & LightGBM inference) | **$52.00** |
| **Database (MongoDB Atlas / DocumentDB)** | M10 Cluster / t3.medium instance (General Purpose 30GB SSD storage) | **$25.00** |
| **AWS CloudWatch & Secrets Manager** | Log ingestion (20 GB logs/mo) + 2 Secrets (MongoDB URI, JWT Secret) | **$4.00** |
| **Total Estimated Monthly Operating Cost** | **Fully Managed Production Tier** | **$122.00 / month** |

---

## Cost Optimization & Scaling Strategies
1. **Fargate Spot Provisioning**: Utilizing Fargate Spot for non-critical ML batch processing can reduce Fargate compute costs by up to 70%.
2. **Auto-Scaling Policies**: Scale the ML Service from 1 task to 4 tasks based on ALB request count per minute and target CPU utilization (>75%).
3. **Model Weights Caching**: Bake pre-loaded AST, Perch, and YAMNet model weights into standard container images or mount an EFS volume to eliminate cold-start downloading overhead.
