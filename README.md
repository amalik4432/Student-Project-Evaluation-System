# AI-Assisted Student Project Evaluation and Management System

A role-based platform for managing student project proposals, supervision, document workflows, and AI-assisted evaluation across multiple semesters.

> **Final Year Project – I**
> Government College University Faisalabad – Chiniot Campus
> BS Computer Science
> **Status:** Under active development

## Overview

Managing final-year projects across multiple semesters can create a significant administrative and review burden for faculty members. Proposal documents may be submitted through printed copies, email, or separate systems, making it difficult to track project status, supervision requests, documents, and feedback in one place.

This project aims to provide a centralized platform where students, faculty members, and department administrators can manage the project lifecycle digitally.

The system also incorporates AI-assisted features to help faculty members understand and evaluate student submissions more efficiently.

## Key Features

### Role-Based Project Management

The platform is designed around three primary roles:

- **Student** – Submit proposals, request supervisors, upload documents, and track project progress.
- **Teacher** – Review proposals, manage supervision requests, access student documents, and provide feedback.
- **Admin / HOD** – Manage departmental project information and maintain visibility across students, teachers, and semesters.

### Proposal Management

Students can submit project proposals and track their status through defined stages instead of relying on printed documents or fragmented communication.

### Supervisor Management

The system supports the workflow for requesting, reviewing, and assigning project supervisors.

### Secure File Management

Project-related documents can be uploaded and managed through the platform rather than relying on physical copies or scattered email attachments.

### AI Proposal Reviewer

An AI-assisted reviewer analyzes proposal content and provides structured feedback on areas such as:

- Problem statement
- Objectives
- Methodology
- Project scope
- Missing information
- Potential improvements

The reviewer is designed to provide students with preliminary feedback before formal faculty evaluation.

### Faculty Document Summarizer

A locally running AI summarization component condenses lengthy student documents into shorter summaries to help faculty members understand submissions more efficiently without relying on an external summarization API.

## Technology Stack

| Area             | Technology                       |
| ---------------- | -------------------------------- |
| Frontend         | React                            |
| Backend          | Node.js, Express.js              |
| Database         | MongoDB, Mongoose                |
| Authentication   | JWT                              |
| Authorization    | Role-Based Access Control (RBAC) |
| AI Integration   | LLM API + Local AI Summarization |
| API Architecture | REST API                         |
| Development      | JavaScript, MERN Stack           |

## System Architecture

The application follows a layered backend architecture:

```text
React Frontend
      │
      ▼
REST API
      │
      ▼
Routes
      │
      ▼
Controllers
      │
      ▼
Services / Business Logic
      │
      ├── Authentication & RBAC
      ├── File Management
      ├── Proposal Management
      └── AI Services
      │
      ▼
MongoDB / Mongoose
```

Middleware is used for authentication, authorization, validation, error handling, and file-related operations.

## My Contribution

This project is being developed as a two-member Final Year Project team.

My primary contribution has focused on the backend and AI-related components, including:

- Database models and schema design
- Authentication and JWT-based authorization
- Role-Based Access Control
- File management functionality
- Backend architecture and API development
- AI service layer
- Document summarization functionality
- Proposal review service integration

The frontend and remaining system components are being developed as part of the ongoing project work.

## Current Status

The project is currently in **FYP-I development**.

### Implemented

- Core database models
- Authentication
- Role-Based Access Control
- File management foundation
- Backend architecture
- AI service layer
- AI-assisted document summarization
- Proposal review service foundation

### In Progress / Planned for FYP-II

- Remaining backend controllers and functionality
- Student portal
- Teacher portal
- Admin/HOD portal
- Complete frontend-backend integration
- Integration testing
- Load and performance testing
- User acceptance testing
- Pilot deployment
- Formal evaluation of the AI proposal reviewer

## Project Scope

The system is designed to support the project lifecycle across multiple semesters, including:

```text
Project Proposal
      ↓
Proposal Review
      ↓
Supervisor Request
      ↓
Supervisor Assignment
      ↓
Document Submission
      ↓
Faculty Review & Feedback
      ↓
Project Progress Tracking
```

## AI Components

The project currently includes two AI-assisted components.

### 1. AI Proposal Reviewer

The proposal reviewer uses an LLM-based service to analyze submitted project proposals and generate structured feedback.

The system focuses on areas such as:

- Clarity of the problem
- Quality of objectives
- Methodology
- Scope
- Missing information
- Suggested improvements

### 2. Faculty Document Summarizer

The document summarizer uses a locally running AI model to produce concise summaries of lengthy student documents.

The objective is to reduce the amount of time faculty members need to spend reading long submissions while retaining the important information.

## Project Structure

The repository is organized around the application's frontend, backend, and project documentation.

```text
project/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── ...
│
├── frontend/
│   └── ...
│
├── docs/
│   ├── FYP-I-Report.pdf
│   └── FYP-I-Presentation.pdf
│
├── .env.example
├── .gitignore
└── README.md
```

## Security

The application uses JWT-based authentication and role-based authorization to restrict access to resources according to user roles.

Sensitive configuration values such as API keys, database credentials, and JWT secrets are stored through environment variables and are **not included in the repository**.

## Documentation

The `docs/` directory contains the FYP-I documentation:

- FYP-I Report
- FYP-I Presentation

These documents describe the problem, requirements, architecture, AI components, implementation, limitations, and planned future work in greater detail.

## Future Development

The next development phase will focus on completing the remaining application functionality and evaluating the system in a realistic departmental environment.

Planned work includes:

- Completing all role-based portals
- Completing backend workflows
- End-to-end system integration
- Performance and load testing
- User acceptance testing
- Pilot deployment
- Quantitative evaluation of the AI proposal reviewer
- Further improvement of AI-assisted document processing

## Academic Project

**Project:** AI-Assisted Student Project Evaluation and Management System
**Degree:** BS Computer Science
**Institution:** Government College University Faisalabad – Chiniot Campus
**Project Phase:** Final Year Project – I
**Expected Graduation:** June 2027
