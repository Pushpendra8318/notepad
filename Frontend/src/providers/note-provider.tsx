import { FC, useState, createContext } from "react";
import { toast } from "react-hot-toast";
import { Note } from "@/types";

const HOST = import.meta.env.VITE_HOST;

interface InitialDataType {
  notes: Note[] | null;
  deleteNote: (id: string) => void;
  fetchNotes: () => void;
}

const initialData: InitialDataType = {
  notes: null,
  deleteNote: () => {},
  fetchNotes: () => {},
};

export const NoteContext = createContext<InitialDataType>(initialData);

interface NoteProviderProps {
  children: React.ReactNode;
}

const NoteProvider: FC<NoteProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[] | null>(null);

  // ✅ Attach Authorization header with Bearer token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${HOST}/api/notes/fetchallnotes`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const json = await response.json();

      if (response.ok) {
        setNotes(json.notes || []);
      } else {
        toast.error(json.message || "Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Something went wrong while fetching notes");
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`${HOST}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        toast.success(json.message || "Note deleted successfully");
        fetchNotes();
      } else {
        toast.error(json.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Something went wrong while deleting note");
    }
  };

  return (
    <NoteContext.Provider value={{ notes, deleteNote, fetchNotes }}>
      {children}
    </NoteContext.Provider>
  );
};

export default NoteProvider;
