import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../api/queryClient";
import { wardrobeApi, type ClothingItemInput, type WardrobeQuery } from "../../../api/wardrobe";

export const wardrobeKeys = {
  all: ["wardrobe"] as const,
  list: (query: WardrobeQuery) => ["wardrobe", query] as const,
  detail: (id: string) => ["wardrobe", id] as const
};

export function useWardrobe(query: WardrobeQuery = {}) {
  return useQuery({
    queryKey: wardrobeKeys.list(query),
    queryFn: () => wardrobeApi.list(query)
  });
}

export function useClothingItem(id: string) {
  return useQuery({
    queryKey: wardrobeKeys.detail(id),
    queryFn: () => wardrobeApi.detail(id),
    enabled: Boolean(id)
  });
}

export function useCreateClothingItem() {
  return useMutation({
    mutationFn: (input: ClothingItemInput) => wardrobeApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wardrobeKeys.all })
  });
}

export function useUpdateClothingItem() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClothingItemInput }) => wardrobeApi.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.all });
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.detail(variables.id) });
    }
  });
}

export function useDeleteClothingItem() {
  return useMutation({
    mutationFn: (id: string) => wardrobeApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wardrobeKeys.all })
  });
}
