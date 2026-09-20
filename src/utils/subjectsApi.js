import axios from "axios";
import { getCurrentUser, getSchoolId } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

function actorIds() {
  return {
    schoolId: getSchoolId(),
    createdBy: getCurrentUser()?._id,
    updatedBy: getCurrentUser()?._id,
  };
}

export async function getSubjectsBySchool(status) {
  const { schoolId } = actorIds();
  const payload = { schoolId };
  if (status === "ACTIVE" || status === "INACTIVE") {
    payload.status = status;
  }

  const { data } = await axios.post(
    `${API_BASE}/subject/getSubjectsBySchool`,
    payload
  );

  return {
    totalSubjects: data?.totalSubjects || 0,
    counts: {
      ACTIVE: data?.counts?.ACTIVE || 0,
      INACTIVE: data?.counts?.INACTIVE || 0,
    },
    data: data?.data || [],
  };
}

export async function getSubjectsByClass(classId, status) {
  const { schoolId } = actorIds();
  const payload = { schoolId, classId };
  if (status === "ACTIVE" || status === "INACTIVE") {
    payload.status = status;
  }

  const { data } = await axios.post(
    `${API_BASE}/subject/getSubjectsByClass`,
    payload
  );

  return {
    totalSubjects: data?.totalSubjects || 0,
    counts: {
      ACTIVE: data?.counts?.ACTIVE || 0,
      INACTIVE: data?.counts?.INACTIVE || 0,
    },
    data: data?.data || [],
  };
}

export async function addSubject({
  subjectName,
  description,
  status = "ACTIVE",
  classIds = [],
}) {
  const { schoolId, createdBy } = actorIds();

  const { data } = await axios.post(`${API_BASE}/subject/addSubjects`, {
    schoolId,
    subjectName,
    description,
    status,
    classIds,
    createdBy,
  });

  return data?.data;
}

export async function assignSubjectToClasses(subjectId, classIds = []) {
  const { schoolId, updatedBy } = actorIds();

  const { data } = await axios.post(
    `${API_BASE}/subject/assignSubjectToClasses`,
    {
      schoolId,
      subjectId,
      classIds,
      updatedBy,
    }
  );

  return data?.data;
}

export async function updateSubject({ subjectId, subjectName, description }) {
  const { schoolId, updatedBy } = actorIds();

  const { data } = await axios.post(`${API_BASE}/subject/updateSubject`, {
    schoolId,
    subjectId,
    subjectName,
    description,
    updatedBy,
  });

  return data?.data;
}

export async function updateSubjectStatus(subjectId, status) {
  const { schoolId, updatedBy } = actorIds();

  const { data } = await axios.post(`${API_BASE}/subject/updateSubjectStatus`, {
    schoolId,
    subjectId,
    status,
    updatedBy,
  });

  return data?.data;
}

export async function deleteSubject(subjectId) {
  const { schoolId } = actorIds();

  const { data } = await axios.post(`${API_BASE}/subject/deleteSubject`, {
    schoolId,
    subjectId,
  });

  return data;
}
