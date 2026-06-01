const { supabase } = require('../config/database');
const logger = require('../utils/logger');

async function getUnifiedDashboard(userId) {
  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('connected_accounts')
      .select('id, platform, platform_username, followers_count, profile_picture_url')
      .eq('user_id', userId);

    if (accountsError) {
      throw accountsError;
    }

    if (!accounts || accounts.length === 0) {
      return {
        totalFollowers: 0,
        totalViews: 0,
        totalEarnings: 0,
        accounts: [],
        platformBreakdown: {},
      };
    }

    let totalFollowers = 0;
    let totalViews = 0;
    let totalEarnings = 0;
    const platformBreakdown = {};

    for (const account of accounts) {
      const { data: stats, error: statsError } = await supabase
        .from('platform_stats')
        .select('followers_count, views_count, earnings')
        .eq('account_id', account.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      const { data: earnings, error: earningsError } = await supabase
        .from('earnings')
        .select('amount')
        .eq('account_id', account.id);

      const followers = stats?.followers_count || account.followers_count || 0;
      const views = stats?.views_count || 0;
      const accountEarnings = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      totalFollowers += followers;
      totalViews += views;
      totalEarnings += accountEarnings;

      platformBreakdown[account.platform] = {
        username: account.platform_username,
        followers,
        views,
        earnings: accountEarnings,
        profilePicture: account.profile_picture_url,
      };
    }

    return {
      totalFollowers,
      totalViews,
      totalEarnings,
      accounts: accounts.length,
      platformBreakdown,
    };
  } catch (error) {
    logger.error('Error fetching unified dashboard:', error);
    throw error;
  }
}

async function getPlatformDashboard(userId, platform) {
  try {
    const { data: account, error: accountError } = await supabase
      .from('connected_accounts')
      .select('id, platform_username, followers_count, profile_picture_url')
      .eq('user_id', userId)
      .eq('platform', platform)
      .single();

    if (!account) {
      throw new Error(`No ${platform} account connected`);
    }

    const { data: stats, error: statsError } = await supabase
      .from('platform_stats')
      .select('followers_count, views_count, earnings, recorded_at')
      .eq('account_id', account.id)
      .order('recorded_at', { ascending: false })
      .limit(30);

    const { data: earnings, error: earningsError } = await supabase
      .from('earnings')
      .select('amount, source, recorded_at')
      .eq('account_id', account.id)
      .order('recorded_at', { ascending: false });

    const currentStats = stats && stats.length > 0 ? stats[0] : null;

    return {
      platform,
      username: account.platform_username,
      profilePicture: account.profile_picture_url,
      currentFollowers: currentStats?.followers_count || account.followers_count || 0,
      currentViews: currentStats?.views_count || 0,
      totalEarnings: earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      statsHistory: stats || [],
      earningsHistory: earnings || [],
    };
  } catch (error) {
    logger.error(`Error fetching ${platform} dashboard:`, error);
    throw error;
  }
}

async function recordPlatformStats(accountId, platform, stats) {
  try {
    const { data, error } = await supabase
      .from('platform_stats')
      .insert([
        {
          account_id: accountId,
          platform,
          followers_count: stats.followers || 0,
          views_count: stats.views || 0,
          engagement_rate: stats.engagementRate || 0,
          recorded_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Platform stats recorded for account ${accountId}`);

    return data;
  } catch (error) {
    logger.error('Error recording platform stats:', error);
    throw error;
  }
}

async function recordEarnings(userId, accountId, amount, source) {
  try {
    const { data, error } = await supabase
      .from('earnings')
      .insert([
        {
          user_id: userId,
          account_id: accountId,
          amount,
          source,
          recorded_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info(`Earnings recorded: ${amount} from ${source}`);

    return data;
  } catch (error) {
    logger.error('Error recording earnings:', error);
    throw error;
  }
}

module.exports = {
  getUnifiedDashboard,
  getPlatformDashboard,
  recordPlatformStats,
  recordEarnings,
};
