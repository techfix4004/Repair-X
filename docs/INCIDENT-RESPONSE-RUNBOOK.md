# RepairX Incident Response Runbook

## Emergency Contacts

### Critical Escalation Chain
1. **On-Call Engineer** - Primary response within 5 minutes
2. **Technical Lead** - Secondary response within 15 minutes  
3. **Engineering Manager** - Business escalation within 30 minutes
4. **CTO/VP Engineering** - Executive escalation within 1 hour

### External Contacts
- **Security Team**: security@repairx.com
- **Infrastructure Provider**: AWS Support (Enterprise)
- **CDN/WAF Provider**: Cloudflare Support
- **Database Support**: PostgreSQL Professional Services

## Incident Classification

### Severity Levels

#### SEV-1 (Critical)
- **Impact**: Complete service outage or data breach
- **Response Time**: < 5 minutes
- **Resolution Target**: < 1 hour
- **Examples**:
  - All services down
  - Database corruption
  - Security breach confirmed
  - Payment system failure

#### SEV-2 (High)
- **Impact**: Major functionality impaired
- **Response Time**: < 15 minutes
- **Resolution Target**: < 4 hours
- **Examples**:
  - Single service down
  - High error rates (>5%)
  - Performance severely degraded
  - Authentication system issues

#### SEV-3 (Medium)
- **Impact**: Minor functionality issues
- **Response Time**: < 30 minutes
- **Resolution Target**: < 24 hours
- **Examples**:
  - Non-critical feature down
  - Moderate performance issues
  - Minor security concerns
  - Single-customer issues

#### SEV-4 (Low)
- **Impact**: Cosmetic or minor issues
- **Response Time**: < 2 hours
- **Resolution Target**: < 72 hours
- **Examples**:
  - Documentation issues
  - Minor UI bugs
  - Enhancement requests

## Incident Response Procedures

### 1. Detection & Alert Response

#### When Alerts Fire
1. **Acknowledge Alert** within 5 minutes
2. **Assess Severity** using classification above
3. **Create Incident** in monitoring system
4. **Notify Team** via incident channel
5. **Begin Investigation** immediately

#### Initial Assessment Checklist
- [ ] Confirm alert is not false positive
- [ ] Check related services and dependencies
- [ ] Review recent deployments or changes
- [ ] Estimate customer impact and business risk
- [ ] Determine if escalation is needed

### 2. Service Down (SEV-1)

#### Immediate Actions (0-5 minutes)
```bash
# Check service health
curl -f http://backend:3001/api/health/live
curl -f http://frontend:3000/health

# Check container status
docker ps
docker-compose ps

# Check resource usage
docker stats
free -h
df -h
```

#### Investigation Steps (5-15 minutes)
```bash
# Check application logs
docker-compose logs backend --tail=100
docker-compose logs frontend --tail=100

# Check infrastructure logs
journalctl -u docker --since "1 hour ago"

# Check database connectivity
docker-compose exec postgres pg_isready -U repairx_user

# Check Redis connectivity
docker-compose exec redis redis-cli ping

# Review monitoring dashboards
# - Grafana: http://localhost:3003
# - Prometheus: http://localhost:9090
```

#### Resolution Actions
```bash
# If containers are down
docker-compose up -d

# If database is unresponsive
docker-compose restart postgres
# Wait 30 seconds for startup
docker-compose exec postgres pg_isready -U repairx_user

# If memory issues detected
# Scale services or restart with more resources
docker-compose up -d --scale backend=2

# If disk space issues
# Clean up logs and temporary files
docker system prune -f
```

### 3. High Latency/Performance Issues (SEV-2)

#### Investigation Checklist
```bash
# Check current performance metrics
curl -s http://localhost:3001/api/metrics | grep http_request_duration

# Database performance check
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Check active connections
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT count(*) as active_connections, state 
FROM pg_stat_activity 
GROUP BY state;"

# Redis performance check
docker-compose exec redis redis-cli info stats

# System resource check
htop
iotop
```

#### Common Fixes
```bash
# Database connection pooling issues
# Restart backend to reset connection pool
docker-compose restart backend

# Cache warming for cold Redis
docker-compose exec redis redis-cli flushall
# (Application will rebuild cache)

# If high CPU on database
# Kill expensive queries
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT pg_cancel_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';"
```

### 4. Security Incident Response (SEV-1/SEV-2)

#### Immediate Containment (0-5 minutes)
```bash
# Check for suspicious IPs in logs
grep "429\|403\|401" /var/log/nginx/access.log | head -20

# Block suspicious IPs (if identified)
iptables -A INPUT -s <SUSPICIOUS_IP> -j DROP

# Check authentication logs
docker-compose logs backend | grep -i "failed.*login\|security\|suspicious"

# Review recent successful logins
curl -s http://localhost:3001/api/v1/auth/audit | jq '.data.entries[] | select(.action == "login" and .result == "success")'
```

#### Security Assessment (5-30 minutes)
```bash
# Check for data exfiltration
docker-compose logs backend | grep -i "download\|export\|bulk"

# Review administrative actions
curl -s http://localhost:3001/api/v1/auth/audit | jq '.data.entries[] | select(.action | contains("admin"))'

# Check for privilege escalation attempts
docker-compose logs backend | grep -i "permission\|role\|privilege"

# Validate 2FA bypass attempts
docker-compose logs backend | grep -i "2fa\|totp\|bypass"
```

#### Response Actions
```bash
# Force logout all sessions (if breach suspected)
# Invalidate all refresh tokens
docker-compose exec redis redis-cli flushdb

# Reset admin passwords (if compromised)
# Notify affected users immediately

# Enable additional logging
# Update log levels to DEBUG temporarily
docker-compose restart backend

# Document incident timeline
# Screenshot evidence of intrusion
# Preserve logs for forensic analysis
```

### 5. Database Issues (SEV-1/SEV-2)

#### Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U repairx_user -d repairx_dev

# Check active connections
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT count(*) FROM pg_stat_activity;"

# Check max connections limit
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SHOW max_connections;"

# If connection limit reached
# Kill idle connections
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < now() - interval '10 minutes';"
```

#### Performance Issues
```bash
# Check slow queries
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT query, calls, total_time, mean_time, rows 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY total_time DESC 
LIMIT 10;"

# Check locks
docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity 
  ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
  ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity 
  ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;"

# Kill blocking queries if necessary
# docker-compose exec postgres psql -U repairx_user -d repairx_dev -c "
# SELECT pg_cancel_backend(<blocking_pid>);"
```

### 6. Monitoring System Issues

#### Prometheus Down
```bash
# Check Prometheus status
curl -f http://localhost:9090/-/healthy

# Restart Prometheus
docker-compose -f docker-compose.monitoring.yml restart prometheus

# Check configuration syntax
docker-compose -f docker-compose.monitoring.yml exec prometheus promtool check config /etc/prometheus/prometheus.yml
```

#### Grafana Issues
```bash
# Restart Grafana
docker-compose -f docker-compose.monitoring.yml restart grafana

# Check logs for errors
docker-compose -f docker-compose.monitoring.yml logs grafana --tail=50

# Reset admin password if needed
docker-compose -f docker-compose.monitoring.yml exec grafana grafana-cli admin reset-admin-password admin
```

#### ELK Stack Issues
```bash
# Check Elasticsearch health
curl -s http://localhost:9200/_cluster/health | jq

# Restart ELK services in order
docker-compose -f docker-compose.monitoring.yml restart elasticsearch
sleep 30
docker-compose -f docker-compose.monitoring.yml restart logstash
docker-compose -f docker-compose.monitoring.yml restart kibana

# Clear Elasticsearch indices if disk full
curl -X DELETE http://localhost:9200/repairx-logs-*?older=7d
```

## Communication Procedures

### Internal Communication

#### Incident Start
**Template**: "🚨 SEV-[1/2] INCIDENT: [Brief Description]
- **Impact**: [Customer/Business Impact]
- **ETA**: [Expected Resolution Time]
- **IC**: [Incident Commander Name]
- **Status**: Investigating/Mitigating/Resolved"

#### Status Updates (Every 30 minutes for SEV-1/2)
**Template**: "📊 UPDATE: [Incident Title]
- **Status**: [Current Status]
- **Actions Taken**: [What was done]
- **Next Steps**: [What's being done now]
- **ETA**: [Updated ETA]"

#### Resolution
**Template**: "✅ RESOLVED: [Incident Title]
- **Resolution**: [How it was fixed]
- **Root Cause**: [What caused it]
- **Prevention**: [How we'll prevent it]
- **Postmortem**: [Link to postmortem document]"

### External Communication (Customer-facing)

#### Status Page Updates
- **Location**: status.repairx.com
- **Update Frequency**: Every 15 minutes for SEV-1, 30 minutes for SEV-2
- **Tone**: Professional, transparent, solution-focused

#### Customer Support
- **Critical Issues**: Proactive outreach to affected customers
- **Medium Issues**: Response to incoming support requests
- **Communication Channel**: Email, in-app notifications

## Post-Incident Procedures

### Immediate (Within 24 hours)
1. **Document Timeline** - Chronological sequence of events
2. **Identify Root Cause** - Technical analysis of failure
3. **Assess Customer Impact** - Quantify affected users and data
4. **Document Lessons Learned** - What worked, what didn't

### Short-term (Within 1 week)
1. **Postmortem Meeting** - All stakeholders review incident
2. **Action Items** - Assign prevention tasks with owners/dates
3. **Process Improvements** - Update runbooks and procedures
4. **Tool Enhancements** - Improve monitoring and alerting

### Long-term (Within 1 month)
1. **Implement Preventions** - Technical fixes and process changes
2. **Test Improvements** - Validate fixes work as expected
3. **Update Documentation** - Keep runbooks current
4. **Share Knowledge** - Team training and knowledge sharing

## Postmortem Template

```markdown
# Postmortem: [Incident Title]

## Summary
[Brief description of what happened]

## Timeline
- **[Time]**: [Event description]
- **[Time]**: [Event description]

## Root Cause
[Technical explanation of the root cause]

## Impact
- **Duration**: X hours Y minutes
- **Customers Affected**: X,XXX users
- **Services Affected**: [List of services]
- **Business Impact**: $X revenue impact

## What Went Well
- [Positive aspects of response]

## What Went Poorly  
- [Areas for improvement]

## Action Items
| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| [Action] | [Name] | [Date] | [Status] |

## Prevention
[How we'll prevent this in the future]
```

## Emergency Procedures

### Data Center Outage
1. **Activate DR Site** within 15 minutes
2. **Update DNS** to point to DR resources
3. **Notify Customers** of temporary service location
4. **Monitor Performance** of DR environment

### Security Breach
1. **Contain Breach** immediately
2. **Notify Security Team** within 5 minutes
3. **Preserve Evidence** for investigation
4. **Notify Legal/Compliance** within 1 hour
5. **Customer Notification** per legal requirements

### Key Personnel Unavailable
1. **Activate Backup On-Call** within 15 minutes
2. **Escalate to Next Level** if needed
3. **Document Actions** taken by backup
4. **Brief Primary** when available

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Next Review**: Quarterly or after major incidents