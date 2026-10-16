# 🌾 AgriPulse - Smart Farming DevSecOps & Kubernetes Platform

AgriPulse යනු ශ්‍රී ලාංකික සහ ගෝලීය ගොවීන් සඳහා නිර්මාණය කරන ලද නවීන **IoT Smart Farming Web Application** එකකි. මෙම ව්‍යාපෘතිය සම්පූර්ණ **DevSecOps** සංකල්ප සහ **Kubernetes** භාවිතයෙන් ආරක්ෂිතව නිෂ්පාදන පරිසරයක (Production) ධාවනය කිරීම සඳහා නිර්මාණය කර ඇත.

---

## 📁 Folder Structure

```
agripulse-devsecops-k8s/
├── package.json                     # App එකට අවශ්‍ය libraries (Express, Helmet, RateLimiter ආදිය)
├── server.js                        # ගොවීන්ගේ Smart Farming Web App එක + Kubernetes Health Probes
├── Dockerfile                       # Multi-Stage + Non-Root ආරක්ෂිත Dockerfile එක
├── sonar-project.properties         # SonarQube ස්කෑන් එකට අවශ්‍ය සැකසුම් (SAST)
├── k8s/
│   ├── deployment.yaml              # Kubernetes Pods 2ක් දුවන සහ ආරක්ෂාව තහවුරු කළ Deployment එක
│   └── service.yaml                 # App එක එළියට විවෘත කරන K8s Service එක (NodePort 30080)
├── .github/
│   └── workflows/
│       └── devsecops.yml            # Gitleaks + SonarQube + Trivy + DockerHub Pipeline එක
└── README.md                        # ව්‍යාපෘතිය පිළිබඳ විස්තරය සහ මාර්ගෝපදේශය
```

---

## 🚀 App එක Local පරිගණකයේ ධාවනය කිරීම (Run Locally)

1. Dependencies ස්ථාපනය කරන්න:
   ```bash
   npm install
   ```

2. Application එක run කරන්න:
   ```bash
   npm start
   ```

3. Browser එකෙන් පිවිසෙන්න:
   ```
   http://localhost:3000
   ```

---

## 🐳 Multi-Stage & Non-Root Docker Image එක Build කර ධාවනය කිරීම

1. ආරක්ෂිත Docker image එක build කරන්න:
   ```bash
   docker build -t agripulse-app:1.0.0 .
   ```

2. Image එක container එකක් ලෙස run කරන්න:
   ```bash
   docker run -d -p 3000:3000 --name agripulse-container agripulse-app:1.0.0
   ```

3. සෞඛ්‍ය පරීක්ෂණ (Health Check) තහවුරු කරගැනීම:
   ```bash
   curl http://localhost:3000/healthz
   ```

---

## ☸️ Kubernetes (K8s) වෙත Deploy කිරීම

1. Deployment සහ Service එක apply කරන්න:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   ```

2. Pods 2ක් ක්‍රියාත්මක වන බව පරීක්ෂා කරන්න:
   ```bash
   kubectl get pods -l app=agripulse
   ```

3. Service එක පරීක්ෂා කර Browser එකෙන් App එක බලන්න:
   ```bash
   kubectl get svc agripulse-service
   # Minikube භාවිතා කරන්නේ නම්:
   minikube service agripulse-service
   ```

---

## 🛡️ DevSecOps Pipeline ආරක්ෂණ පියවර (Security Gates)

GitHub Actions workflow (`.github/workflows/devsecops.yml`) මඟින් පහත ආරක්ෂණ පියවර ස්වයංක්‍රීයව සිදුවේ:

1. **Gitleaks (Secret Scanning)**: Code එක තුළ API Keys හෝ Passwords නිරාවරණය වී ඇත්දැයි පරීක්ෂා කරයි.
2. **SCA & Audit**: `npm audit` මඟින් 3rd party libraries වල දුර්වලතා හඳුනා ගනී.
3. **SonarQube (SAST)**: Source code එකෙහි bugs, code smells සහ vulnerabilities පරීක්ෂා කරයි.
4. **Trivy (Container Security)**: Docker image එකෙහි CVEs (Common Vulnerabilities and Exposures) ස්කෑන් කරයි.
5. **Docker Hub Registry Push**: සියලුම ආරක්ෂණ පරීක්ෂණ සමත් වූ පසු පමණක් ආරක්ෂිත Image එක Docker Hub වෙත Push කරයි.
6. **K8s Manifest Validation**: Kubernetes yaml ගොනු වල නිවැරදි බව තහවුරු කරයි.

### GitHub Secrets සැකසීම:
- `DOCKERHUB_USERNAME`: ඔබගේ Docker Hub username එක
- `DOCKERHUB_TOKEN`: ඔබගේ Docker Hub Access Token එක
- `SONAR_TOKEN`: SonarQube / SonarCloud access token එක
- `SONAR_HOST_URL`: SonarQube server URL එක
