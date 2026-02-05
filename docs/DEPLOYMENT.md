# Cloud Deployment Guide

This guide covers deploying the Melsoft Hospital Digitisation System Backend to various cloud platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Account**: Set up a Supabase project for the database
2. **Email Service**: Configure SMTP settings (optional, for emails)
3. **Redis Instance**: For queues and rate limiting (provided by most platforms)

## Environment Variables

Required environment variables for production:

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-secure-random-string
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@melsoft.com
REDIS_URL=redis://localhost:6379
```

## Deployment Options

### Option 1: Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. **Using render.yaml**:
   - Fork/clone this repository
   - Connect your GitHub account to Render
   - Create a new Blueprint instance
   - Point it to your repository
   - Render will automatically detect `render.yaml` and provision services

2. **Manual Setup**:
   - Create a new Web Service on Render
   - Connect your repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables from the dashboard
   - Create a Redis instance and link it

3. **Health Checks**:
   - Path: `/api/health`
   - Interval: 30 seconds

### Option 2: Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. **Using railway.json**:
   - Connect your GitHub repository to Railway
   - Railway will detect `railway.json` configuration
   - Add environment variables in the dashboard
   - Add a Redis plugin from the Railway marketplace

2. **Manual Setup**:
   - Create a new project on Railway
   - Add a service from GitHub repo
   - Add Redis plugin
   - Configure environment variables
   - Deploy

### Option 3: Heroku

1. **Prerequisites**:
   ```bash
   heroku login
   heroku create melsoft-hospital-server
   ```

2. **Add Redis**:
   ```bash
   heroku addons:create heroku-redis:hobby-dev
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your-url
   heroku config:set SUPABASE_ANON_KEY=your-key
   # ... set other variables
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

5. **Scale**:
   ```bash
   heroku ps:scale web=1
   ```

### Option 4: Docker (Self-Hosted/AWS/GCP/Azure)

1. **Build Docker Image**:
   ```bash
   docker build -t melsoft-hospital-server .
   ```

2. **Run with Docker Compose** (includes Redis):
   ```bash
   docker-compose up -d
   ```

3. **Run Docker Container** (standalone):
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e NODE_ENV=production \
     -e SUPABASE_URL=your-url \
     -e SUPABASE_ANON_KEY=your-key \
     -e REDIS_URL=redis://redis:6379 \
     --name hospital-server \
     melsoft-hospital-server
   ```

4. **Deploy to Cloud Container Services**:
   - **AWS ECS/Fargate**: Push to ECR and create ECS service
   - **GCP Cloud Run**: Push to GCR and deploy
   - **Azure Container Instances**: Push to ACR and deploy

### Option 5: DigitalOcean App Platform

1. Create a new app from your repository
2. Detect Dockerfile or use Node.js buildpack
3. Add Redis managed database
4. Configure environment variables
5. Set health check path: `/api/health`

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://your-app-url.com/api/health

# Expected response:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Test API Endpoints

```bash
# Test root endpoint
curl https://your-app-url.com/api

# Test signup
curl -X POST https://your-app-url.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 3. Monitor Logs

- **Render**: View logs in dashboard
- **Railway**: `railway logs`
- **Heroku**: `heroku logs --tail`
- **Docker**: `docker logs -f container-name`

### 4. Set Up Monitoring

Consider integrating:
- **Sentry** for error tracking
- **Datadog** or **New Relic** for APM
- **UptimeRobot** for uptime monitoring
- **Prometheus + Grafana** for metrics

## Security Checklist

- [ ] All environment variables set securely (not in code)
- [ ] HTTPS/SSL enabled
- [ ] CORS configured for your frontend domain only
- [ ] Rate limiting enabled
- [ ] Supabase RLS (Row Level Security) policies configured
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place

## Scaling Considerations

### Horizontal Scaling
- Most cloud platforms support auto-scaling
- Configure based on CPU/memory metrics
- Use Redis for session storage to support multiple instances

### Database
- Supabase handles database scaling
- Consider read replicas for heavy read loads
- Implement connection pooling

### Redis
- Use managed Redis services (Redis Cloud, AWS ElastiCache)
- Configure persistence if needed
- Monitor memory usage

## Troubleshooting

### Server Won't Start
- Check environment variables are set correctly
- Verify Supabase credentials
- Check logs for specific error messages

### Database Connection Issues
- Verify Supabase URL and keys
- Check network connectivity
- Ensure Supabase service is running

### Redis Connection Issues
- Verify REDIS_URL is correct
- Check Redis service is running
- Test connection with `redis-cli ping`

### High Memory Usage
- Check for memory leaks in logs
- Monitor with platform-specific tools
- Consider increasing instance size

## Cost Optimization

1. **Start Small**: Use free/starter tiers initially
2. **Monitor Usage**: Track resource consumption
3. **Scale Gradually**: Increase resources based on actual usage
4. **Use Caching**: Redis reduces database load
5. **Optimize Queries**: Index frequently accessed fields

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Open an issue on GitHub
- Contact platform support

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Docker Documentation](https://docs.docker.com)
- [Supabase Documentation](https://supabase.com/docs)
