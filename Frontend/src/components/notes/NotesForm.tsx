import { FC, useContext, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NoteContext } from "@/providers/note-provider";
import { Note } from "@/types";

// ------------------
// Schema
// ------------------
const formSchema = z.object({
  title: z.string().min(3, "Title should be at least 3 characters").max(35, "Title max 35 chars"),
  description: z.string().min(10, "Description should be at least 10 characters").max(120, "Description max 120 chars"),
  tag: z.string().min(3, "Tag should be at least 3 characters").max(8, "Tag max 8 chars"),
});

type NoteFormValues = z.infer<typeof formSchema>;

interface NotesFormProps {
  initialData?: Note | null;
  handleSubmit: () => void;
}

const NotesForm: FC<NotesFormProps> = ({ initialData }) => {
  const { fetchNotes } = useContext(NoteContext);
  const [loading, setLoading] = useState(false);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { title: "", description: "", tag: "general" },
  });

  const toastMessage = initialData ? "Note Updated Successfully" : "Note Created Successfully";
  const action = initialData ? "Save Changes" : "Create";

  const onsubmit = async (data: NoteFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axiosInstance.put(`/api/notes/updatenote/${initialData._id}`, data);
      } else {
        await axiosInstance.post(`/api/notes/addnote`, data);
      }

      toast.success(toastMessage);
      fetchNotes();
      form.reset();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Tag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea disabled={loading} placeholder="Description" rows={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{action}</Button>
            <Button type="reset" disabled={loading} onClick={() => form.reset()}>Reset</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NotesForm;
