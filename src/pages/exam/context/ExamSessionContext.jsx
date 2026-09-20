import { createContext, useContext, useRef, useState } from "react";

const ExamSessionContext = createContext(null);

const emptySession = {
  testId: null,
  attemptId: null,
  title: "",
  mode: "exam",
  durationMin: 30,
  endsAt: null,
  questions: [],
  answers: {},
  verified: false,
};

export function ExamSessionProvider({ children }) {
  const [session, setSession] = useState(emptySession);
  const apiRef = useRef(null);

  if (!apiRef.current) {
    apiRef.current = {
      prepareSession({ testId, title, mode = "exam", durationMin = 30 }) {
        setSession({
          testId,
          attemptId: null,
          title,
          mode,
          durationMin,
          endsAt: null,
          questions: [],
          answers: {},
          verified: false,
        });
      },
      markVerified() {
        setSession((s) => ({ ...s, verified: true }));
      },
      loadAttempt(payload) {
        setSession((s) => ({
          ...s,
          testId: payload.testId,
          attemptId: payload.attemptId,
          title: payload.title || s.title,
          mode: payload.mode === "PRACTICE" ? "practice" : "exam",
          durationMin: payload.durationMin || s.durationMin,
          endsAt: payload.endsAt,
          questions: (payload.questions || []).map((q) => ({
            id: q.id,
            text: q.text,
            options: q.options,
          })),
          answers: payload.answers || {},
          verified: true,
        }));
      },
      setLocalAnswer(questionId, optionIndex) {
        setSession((s) => ({
          ...s,
          answers: { ...s.answers, [questionId]: optionIndex },
        }));
      },
      clearSession() {
        setSession(emptySession);
      },
    };
  }

  return (
    <ExamSessionContext.Provider value={{ session, ...apiRef.current }}>
      {children}
    </ExamSessionContext.Provider>
  );
}

export function useExamSession() {
  const ctx = useContext(ExamSessionContext);
  if (!ctx) {
    throw new Error("useExamSession must be used within ExamSessionProvider");
  }
  return ctx;
}
