import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recurringService } from "@/lib/services/recurring";
import type {
  CreateRecurringTemplateRequest,
  UpdateRecurringTemplateRequest,
} from "@/lib/types";

export const useRecurringTemplates = () => {
  return useQuery({
    queryKey: ["recurring-templates"],
    queryFn: () => recurringService.getTemplates(),
    select: (data) => data.content,
  });
};

export const useRecurringTemplate = (id: string) => {
  return useQuery({
    queryKey: ["recurring-templates", id],
    queryFn: () => recurringService.getTemplate(id),
    enabled: !!id,
  });
};

export const useCreateRecurringTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringTemplateRequest) =>
      recurringService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
};

export const useUpdateRecurringTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRecurringTemplateRequest;
    }) => recurringService.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-templates", id] });
    },
  });
};

export const useDeleteRecurringTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
};
