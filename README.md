# 🛒 Campus Marketplace

Welcome to the **Campus Marketplace** repository! This is a full-stack web application designed to provide a localized digital marketplace platform. 

---

## 🛠️ Tech Stack & Architecture

### 💻 Frontend
* **Technologies:** JavaScript, HTML5, CSS3
* **Description:** A responsive, user-friendly client interface tailored for clean product browsing and seamless user interaction.

### ⚙️ Backend & Database
* **Architecture Pattern:** Model-View-ViewModel (MVVM) principles adapted for clean separation of concerns and robust data flow.
* **Database Management:** Cloud-hosted data clusters managed via MongoDB Atlas to ensure secure scalable storage, automated system health operations, and optimized indexing/hashing performance.

### 🐳 Containerization & Infrastructure
* **Engine:** Docker & Docker Compose (`docker-compose.yml`)
* **Description:** Both the frontend client and backend microservices are fully containerized, allowing the entire multi-container application stack to be provisioned locally with a single command.

---

## 🚀 Continuous Integration & Continuous Deployment (CI/CD)

This project features a fully automated GitOps deployment workflow managed via a local **Jenkins** automation server hosted on a **Fedora Linux** systems environment.

On every code push, Jenkins dynamically pulls the latest changes from this repository and parses the declarative **`Jenkinsfile`** at the root of the project to execute a multi-stage validation pipeline:

1. **Pull Code** – Verifies secure Source Control Management (SCM) connectivity and synchronizes repositories.
2. **Build Environment** – Sets up and verifies localized project compile-time dependencies and package runtimes.
3. **Automated Quality Testing** – Executes end-to-end quality gates and software testing frameworks (leveraging automated web testing) to identify and catch breaking bugs early.
4. **Container Deployment** – Prepares, packages, and stages the validated application code for seamless deployment.

---

## 📦 Local Setup Instructions

To spin up the entire application stack (Frontend, Backend, and Database configurations) locally, ensure you have Docker installed and run:

```bash
docker-compose up --build
