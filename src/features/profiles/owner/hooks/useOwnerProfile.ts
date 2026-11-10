"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getOwnerProfile, updateOwnerProfile } from "../api/ownerProfileApi";
import { ownerProfileKeys } from "../queryKeys";

export function useOwnerProfile() {
  return useQuery({
    queryKey: ownerProfileKeys.detail(),
    queryFn: getOwnerProfile,
    retry: false,
  });
}

export function useUpdateOwnerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOwnerProfile,

    onSuccess: async (profile) => {
      queryClient.setQueryData(ownerProfileKeys.detail(), profile);

      await queryClient.invalidateQueries({
        queryKey: ownerProfileKeys.detail(),
      });
    },
  });
}
