const axios = require('axios');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

async function getYouTubeProfile(accessToken) {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          part: 'snippet,statistics',
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new AppError('No YouTube channel found');
    }

    const channel = response.data.items[0];

    return {
      platformUserId: channel.id,
      username: channel.snippet.title,
      profilePicture: channel.snippet.thumbnails.default.url,
      followers: parseInt(channel.statistics.subscriberCount, 10),
      views: parseInt(channel.statistics.viewCount, 10),
      videos: parseInt(channel.statistics.videoCount, 10),
    };
  } catch (error) {
    logger.error('Error fetching YouTube profile:', error);
    throw error;
  }
}

async function getInstagramProfile(accessToken) {
  try {
    const response = await axios.get(
      'https://graph.instagram.com/me',
      {
        params: {
          fields: 'id,username,name,profile_picture_url,followers_count,media_count',
          access_token: accessToken,
        },
      }
    );

    return {
      platformUserId: response.data.id,
      username: response.data.username,
      profilePicture: response.data.profile_picture_url,
      followers: response.data.followers_count,
      posts: response.data.media_count,
    };
  } catch (error) {
    logger.error('Error fetching Instagram profile:', error);
    throw error;
  }
}

async function getTikTokProfile(accessToken) {
  try {
    const response = await axios.get(
      'https://open.tiktokapis.com/v2/user/info/',
      {
        params: {
          fields: 'open_id,display_name,avatar_large,follower_count,video_count',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const user = response.data.data.user;

    return {
      platformUserId: user.open_id,
      username: user.display_name,
      profilePicture: user.avatar_large,
      followers: user.follower_count,
      videos: user.video_count,
    };
  } catch (error) {
    logger.error('Error fetching TikTok profile:', error);
    throw error;
  }
}

async function getFacebookProfile(accessToken) {
  try {
    const response = await axios.get(
      'https://graph.facebook.com/me',
      {
        params: {
          fields: 'id,name,picture.type(large),fan_count,engagement',
          access_token: accessToken,
        },
      }
    );

    return {
      platformUserId: response.data.id,
      username: response.data.name,
      profilePicture: response.data.picture.data.url,
      followers: response.data.fan_count,
    };
  } catch (error) {
    logger.error('Error fetching Facebook profile:', error);
    throw error;
  }
}

async function getPlatformStats(platform, accessToken) {
  try {
    switch (platform) {
      case 'youtube':
        return await getYouTubeProfile(accessToken);
      case 'instagram':
        return await getInstagramProfile(accessToken);
      case 'tiktok':
        return await getTikTokProfile(accessToken);
      case 'facebook':
        return await getFacebookProfile(accessToken);
      default:
        throw new AppError(`Unknown platform: ${platform}`);
    }
  } catch (error) {
    logger.error(`Error getting stats for ${platform}:`, error);
    throw error;
  }
}

module.exports = {
  getYouTubeProfile,
  getInstagramProfile,
  getTikTokProfile,
  getFacebookProfile,
  getPlatformStats,
};
