const { supabase } = require('../config/database');
const { NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

async function saveConnectedAccount(userId, platform, profileData, tokens) {
  try {
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .insert([
        {
          user_id: userId,
          platform,
          platform_user_id: profileData.platformUserId,
          platform_username: profileData.username,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expires_at || null,
          profile_picture_url: profileData.profilePicture,
          followers_count: profileData.followers || 0,
          connected_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error saving connected account:', error);
      throw error;
    }

    logger.info(`Connected account saved: ${userId} - ${platform}`);

    return account;
  } catch (error) {
    logger.error('Error in saveConnectedAccount:', error);
    throw error;
  }
}

async function getConnectedAccounts(userId) {
  try {
    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select('id, platform, platform_username, followers_count, profile_picture_url, connected_at, last_synced_at')
      .eq('user_id', userId)
      .order('connected_at', { ascending: false });

    if (error) {
      throw error;
    }

    return accounts || [];
  } catch (error) {
    logger.error('Error fetching connected accounts:', error);
    throw error;
  }
}

async function getConnectedAccount(userId, accountId) {
  try {
    const { data: account, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    if (error) {
      throw error;
    }

    return account;
  } catch (error) {
    logger.error('Error fetching connected account:', error);
    throw error;
  }
}

async function deleteConnectedAccount(userId, accountId) {
  try {
    const account = await getConnectedAccount(userId, accountId);

    const { error } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    logger.info(`Connected account deleted: ${accountId}`);

    return { success: true, message: 'Account disconnected successfully' };
  } catch (error) {
    logger.error('Error deleting connected account:', error);
    throw error;
  }
}

async function getAccountCount(userId) {
  try {
    const { data: accounts, error } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return accounts?.length || 0;
  } catch (error) {
    logger.error('Error getting account count:', error);
    throw error;
  }
}

async function hasReachedAccountLimit(userId, userTier) {
  try {
    const accountCount = await getAccountCount(userId);

    if (userTier === 'FREE' && accountCount >= 1) {
      return true;
    }

    if (userTier === 'PREMIUM' && accountCount >= 10) {
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error checking account limit:', error);
    throw error;
  }
}

module.exports = {
  saveConnectedAccount,
  getConnectedAccounts,
  getConnectedAccount,
  deleteConnectedAccount,
  getAccountCount,
  hasReachedAccountLimit,
};
