/**
 * Location API hooks
 * Fetches countries, states, and cities for form selects
 */

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

export type LocationCountry = {
  _id: string;
  name: string;
  status?: string;
};

export type LocationCity = {
  _id: string;
  name: string;
  countryId: string;
  countryName?: string;
  stateId?: string;
  stateName?: string;
  status?: string;
};

const BASE = "/location";

/**
 * Fetch all countries
 */
export const useGetCountries = () => {
  return useQuery({
    queryKey: ["location-countries"],
    queryFn: async () => {
      const response = await apiClient.get<{
        status: string;
        count: number;
        data: LocationCountry[];
      }>(`${BASE}/getCountries`);
      return response.data.data ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10 min cache — rarely changes
  });
};

/**
 * Fetch all cities (optionally filter by countryId on the client)
 */
export const useGetCities = (countryId?: string) => {
  return useQuery({
    queryKey: ["location-cities", countryId],
    queryFn: async () => {
      const response = await apiClient.get<{
        status: boolean | string;
        count: number;
        data: LocationCity[];
      }>(`${BASE}/getCities`);
      const allCities = response.data.data ?? [];
      if (countryId) {
        return allCities.filter((c) => c.countryId === countryId);
      }
      return allCities;
    },
    staleTime: 1000 * 60 * 10,
    enabled: true,
  });
};
