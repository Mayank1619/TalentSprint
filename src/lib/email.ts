import { getDetailedReport, questions, type DetailedReport } from "@/lib/mock-data";

export type EmailKind = "candidate-report" | "examiner-report" | "question-set";

export type EmailRequest = {
  kind: EmailKind;
  candidateId?: string;
  to: string;
};

export type EmailResponse = {
  ok: boolean;
  provider: "resend" | "mock";
  id: string;
  message: string;
};

const resendEndpoint = "https://api.resend.com/emails";

export async function sendTalentSprintEmail(request: EmailRequest): Promise<EmailResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Talent Sprint <onboarding@resend.dev>";
  const subjectAndHtml = buildEmail(request);

  if (!apiKey) {
    return {
      ok: true,
      provider: "mock",
      id: `mock-${Date.now()}`,
      message:
        "Email rendered in mock mode. Add RESEND_API_KEY and RESEND_FROM_EMAIL to send real mail.",
    };
  }

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: request.to,
      subject: subjectAndHtml.subject,
      html: subjectAndHtml.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      ok: false,
      provider: "resend",
      id: "resend-error",
      message: `Resend rejected the request: ${text}`,
    };
  }

  const payload = (await response.json()) as { id?: string };
  return {
    ok: true,
    provider: "resend",
    id: payload.id ?? "resend-sent",
    message: "Email sent through Resend.",
  };
}

function buildEmail(request: EmailRequest) {
  if (request.kind === "question-set") {
    return {
      subject: "Talent Sprint question set",
      html: shell(`
        <h1>Talent Sprint Question Set</h1>
        <p>Here are the current assessment/practice questions prepared for Talent Sprint.</p>
        ${questions
          .map(
            (question) => `
              <section>
                <h2>${escapeHtml(question.title)} (${question.difficulty})</h2>
                <p>${escapeHtml(question.prompt)}</p>
                <p><strong>Tags:</strong> ${question.tags.map(escapeHtml).join(", ")}</p>
                <p><strong>Visible samples:</strong> ${question.sampleTests
                  .map(escapeHtml)
                  .join(" | ")}</p>
              </section>
            `,
          )
          .join("")}
      `),
    };
  }

  const report = getDetailedReport(request.candidateId ?? "cand-001");
  return request.kind === "candidate-report"
    ? buildCandidateReportEmail(report)
    : buildExaminerReportEmail(report);
}

function buildCandidateReportEmail(report: DetailedReport) {
  return {
    subject: `Talent Sprint score summary: ${report.assessmentTitle}`,
    html: shell(`
      <h1>Your Talent Sprint score summary</h1>
      <p><strong>Assessment:</strong> ${escapeHtml(report.assessmentTitle)}</p>
      <p><strong>Score:</strong> ${report.score}%</p>
      <p><strong>Submitted:</strong> ${escapeHtml(report.submittedAt)}</p>
      <p>${escapeHtml(report.summary)}</p>
      <p>This summary does not include hidden test details. The examiner has access to the detailed review.</p>
    `),
  };
}

function buildExaminerReportEmail(report: DetailedReport) {
  return {
    subject: `Talent Sprint detailed report: ${report.candidateName}`,
    html: shell(`
      <h1>Detailed Talent Sprint report</h1>
      <p><strong>Candidate:</strong> ${escapeHtml(report.candidateName)} (${escapeHtml(
        report.candidateEmail,
      )})</p>
      <p><strong>Assessment:</strong> ${escapeHtml(report.assessmentTitle)}</p>
      <p><strong>Score:</strong> ${report.score}%</p>
      <p><strong>Duration used:</strong> ${escapeHtml(report.durationUsed)}</p>
      ${report.questions
        .map(
          (question) => `
            <section>
              <h2>${escapeHtml(question.title)} - ${question.score}/${question.maxScore}</h2>
              <p>${question.visiblePassed}/${question.visibleTotal} visible tests passed, ${question.hiddenPassed}/${question.hiddenTotal} hidden tests passed.</p>
              <pre>${escapeHtml(question.submittedCode)}</pre>
            </section>
          `,
        )
        .join("")}
    `),
  };
}

function shell(content: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#111827">
      ${content}
      <hr />
      <p style="color:#6b7280">Sent by Talent Sprint.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
