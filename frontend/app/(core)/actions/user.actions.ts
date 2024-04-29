'use server';

import axios from '@/app/(core)/utils/axios.utils';
import { User } from '../store/types/user.types';
import qs from 'qs';
import { HttpStatusCode } from 'axios';
import { Following } from '../store/types/following.types';
import { getAuthInfo } from './auth.actions';

export const getUserFriendsAndSuggestions = async (userId: string, limit: number = 10) => {
  let result = {
    friends: [],
    suggestions: [],
  };

  try {
    const followingsResponse = await axios.get(`/users/${userId}/followings`);

    if (followingsResponse.status === HttpStatusCode.Ok) {
      const query = qs.stringify(
        {
          where: {
            followerId: {
              in: followingsResponse.data.map((following: User) => following.id),
            },
          },
          select: { userId: true },
          take: limit,
        },
        { arrayFormat: 'comma', allowDots: true, commaRoundTrip: true } as any,
      );
      const friendsResponse = await axios.get(
        `/users/${userId}/followers${query ? `?${query}` : ''}`,
      );

      if (friendsResponse.status === HttpStatusCode.Ok) {
        result.friends = friendsResponse.data;
        const suggestionsQuery = qs.stringify(
          {
            where: {
              id: {
                notIn: [...followingsResponse.data.map((following: User) => following.id), userId],
              },
            },
            take: limit,
          },
          { arrayFormat: 'comma', allowDots: true, commaRoundTrip: true } as any,
        );

        const suggestionsRepsponse = await axios.get(
          `/users${suggestionsQuery ? `?${suggestionsQuery}` : ''}`,
        );

        if (suggestionsRepsponse.status === HttpStatusCode.Ok) {
          result.suggestions = suggestionsRepsponse.data;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  return result;
};

export const getAllUsers = async (options?: unknown): Promise<User[]> => {
  try {
    const query = qs.stringify(options, {
      arrayFormat: 'comma',
      allowDots: true,
      commaRoundTrip: true,
    } as any);
    const response = await axios.get(`/users${query ? `?${query}` : ''}`);

    if (response.status === HttpStatusCode.Ok) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }

  return [];
};

export const getUser = async (id: string, options?: unknown): Promise<User | null> => {
  try {
    const query = qs.stringify(options);
    const response = await axios.get(`/users/${id}/${query ? `?${query}` : ''}`);

    if (response.status === HttpStatusCode.Ok) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const followUser = async (id: string): Promise<Following | null> => {
  try {
    const authenticatedUser = await getAuthInfo();

    if (authenticatedUser) {
      const response = await axios.post(`/users/${id}/followers/${authenticatedUser.userId}`, {});

      if (response.status === HttpStatusCode.Created) {
        return response.data;
      }
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const unfollowUser = async (id: string): Promise<Following | null> => {
  try {
    const authenticatedUser = await getAuthInfo();

    if (authenticatedUser) {
      const response = await axios.delete(`/users/${id}/followers/${authenticatedUser.userId}`);

      if (response.status === HttpStatusCode.Ok) {
        return response.data;
      }
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};
