import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DoorOpen, Plus, X } from "lucide-react";
import CustomSelect from "../../../common/CustomSelect";
import EdvoraLoader from "../../../common/EdvoraLoader";
import { openSnackbar } from "../../../common/snackbar/snackbar";
import {
  ROOM_TYPES,
  createRoom,
  listRooms,
  updateRoom,
} from "../../../utils/timetableApi";
import TimetableSubnav from "./TimetableSubnav";

const inputClass =
  "w-full h-[42px] rounded-lg border border-[#D0D5DD] bg-white px-3 text-[14px] text-[#344054] outline-none focus:border-[#A77A95]";
const labelClass = "block text-[13px] font-semibold text-[#667085] mb-1.5";
const EMPTY = { name: "", code: "", type: "CLASSROOM", capacity: 40 };

function RoomModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initial?._id);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      return openSnackbar({
        message: "Name and code are required",
        variant: "warning",
      });
    }
    try {
      setSubmitting(true);
      const saved = isEdit
        ? await updateRoom({ roomId: initial._id, ...form })
        : await createRoom(form);
      openSnackbar({
        message: isEdit ? "Room updated" : "Room created",
        variant: "success",
      });
      onSaved?.(saved);
      onClose();
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to save room",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3">
      <div className="w-full max-w-[480px] rounded-[14px] bg-white shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FAEEE9] text-[#A77A95]">
              <DoorOpen size={18} />
            </span>
            <h2 className="text-base font-semibold text-[#111827]">
              {isEdit ? "Edit Room" : "Add Room"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Code</label>
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <CustomSelect
              options={ROOM_TYPES}
              value={form.type}
              onChange={(opt) =>
                setForm((p) => ({ ...p, type: opt?.value || "CLASSROOM" }))
              }
            />
          </div>
          <div>
            <label className={labelClass}>Capacity</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.capacity}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  capacity: Number(e.target.value) || 1,
                }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-lg border border-[#D0D5DD] px-4 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-[42px] rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580] disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimetableRooms() {
  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async (st = status) => {
    try {
      setLoading(true);
      const result = await listRooms(st);
      setRooms(result.data);
    } catch (error) {
      openSnackbar({
        message: error?.response?.data?.message || "Failed to load rooms",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(status);
  }, [status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#735366] sm:text-2xl">
            Rooms
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Classrooms, labs, and shared spaces for timetable booking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal(EMPTY)}
          className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[#A77A95] px-4 text-sm font-medium text-white hover:bg-[#8F6580]"
        >
          <Plus size={16} /> Add Room
        </button>
      </div>

      <TimetableSubnav />

      <div className="mb-4 flex gap-2">
        {["ACTIVE", "INACTIVE"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              status === s
                ? "bg-[#A77A95] text-white"
                : "border border-[#E8D5CE] bg-white text-[#735366]"
            }`}
          >
            {s === "ACTIVE" ? "Active" : "Inactive"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <EdvoraLoader message="Loading rooms…" />
        </div>
      ) : !rooms.length ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No rooms found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-[#A77A95]/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAEEE9] text-[#A77A95]">
                    <DoorOpen size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-[#735366]">{room.name}</p>
                    <p className="text-xs text-slate-500">
                      {room.code} · {room.type} · Cap {room.capacity}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal(room)}
                  className="rounded-lg border border-[#E8D5CE] px-3 py-1.5 text-xs font-medium text-[#735366]"
                >
                  Edit
                </button>
                <Link
                  to={`/admin/timetable/room/${room._id}`}
                  className="rounded-lg border border-[#E8D5CE] px-3 py-1.5 text-xs font-medium text-[#A77A95]"
                >
                  View schedule
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <RoomModal
          initial={modal._id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => load(status)}
        />
      )}
    </div>
  );
}
