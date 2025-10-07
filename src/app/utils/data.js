// Helper function to detect email status based on subject and text body
function detectStatus(subject, textBody) {
  const content = (subject + ' ' + textBody).toLowerCase();
  if (content.includes('rejected')) return 'rejected';
  if (content.includes('interview')) return 'interview';
  if (content.includes('offer')) return 'offer';
  return 'other';
}

// Helper function to map raw email data to application format
export function mapEmailToApplication(email) {
  const fromEmail = email.from || '';
  const domainMatch = fromEmail.match(/@([^.]+)\./);
  const source = domainMatch ? domainMatch[1] : 'Unknown';

  // Determine status with fallback to 'other'
  const status = String(email.status || detectStatus(email.subject || '', email.text || '')).toLowerCase();

  return {
    id: email.id,
    position: email.jobTitle || (email.subject ? email.subject.split('-')[0]?.trim() : 'Unknown Position') || 'Unknown Position',
    company: email.company || (fromEmail.includes('@') ? fromEmail.split('@')[1].split('.')[0] : 'Unknown Company'),
    name: email.from || '',
    lastUpdate: email.date || null,
    source: source.charAt(0).toUpperCase() + source.slice(1), // Capitalize first letter
    status,
    statusBadge: status.charAt(0).toUpperCase() + status.slice(1),
    from: email.from || '',
    to: email.to || '',
    subject: email.subject || '',
    text: email.text || '',
    html: email.html || '',
    date: email.date || null,
    jobTitle: email.jobTitle || '',
    type: email.type || ''
  };
}

// Fetch all applications (emails) from API
export async function fetchApplications(date) {
  if (!date) {
    console.warn('fetchApplications: No date provided, skipping fetch');
    return [];
  }
  try {
    const res = await fetch(`/api/get-emails?date=${encodeURIComponent(date)}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

    if (!res.ok) {
      const errorMessage = `Failed to fetch applications: ${res.statusText} (${res.status})`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const emails = await res.json();
    return emails.map(mapEmailToApplication);
  } catch (error) {
    console.error('Error fetching applications:', error);
    // Optionally, log additional information
    if (error.res) {
      console.error('Response:', error.res);
    }
    throw error;
  }
}

// Get application by its ID
export async function getApplicationById(id) {
  try {
    const response = await fetch('/api/get-emails');

    if (!response.ok) {
      throw new Error('Failed to fetch application');
    }

    const emails = await response.json();
    const email = emails.find(e => e.id === id);

    if (!email) {
      throw new Error('Application not found');
    }

    return mapEmailToApplication(email);
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error;
  }
}

// Get summary statistics and trends
export async function getSummaryStats() {
  try {
    const applications = await fetchApplications();

    // Calculate counts by status
    const stats = {
      totalApplied: applications.length,
      interviewScheduled: applications.filter(app => app.status === 'interview').length,
      noResponse: applications.filter(app => app.status === 'other').length,
      notSelected: applications.filter(app => app.status === 'rejected').length,
      inProgress: applications.filter(app => app.status === 'offer').length,
    };

    // Date ranges for trend calculation
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Applications in last and this month
    const lastMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= lastMonth && appDate < thisMonth;
    });

    const thisMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= thisMonth;
    });

    // Calculate trends comparing this month vs last month
    const trends = {
      totalApplied: calculateTrend(thisMonthApps.length, lastMonthApps.length),
      interviewScheduled: calculateTrend(
        thisMonthApps.filter(app => app.status === 'interview').length,
        lastMonthApps.filter(app => app.status === 'interview').length
      ),
      noResponse: calculateTrend(
        thisMonthApps.filter(app => app.status === 'other').length,
        lastMonthApps.filter(app => app.status === 'other').length
      ),
      notSelected: calculateTrend(
        thisMonthApps.filter(app => app.status === 'rejected').length,
        lastMonthApps.filter(app => app.status === 'rejected').length
      ),
      inProgress: calculateTrend(
        thisMonthApps.filter(app => app.status === 'offer').length,
        lastMonthApps.filter(app => app.status === 'offer').length
      ),
    };

    return { stats, trends };
  } catch (error) {
    console.error('Error getting summary stats:', error);
    throw error;
  }
}

// Get most recent applications (default limit 5)
export async function getRecentApplications(limit = 5) {
  try {
    const applications = await fetchApplications();
    return applications
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent applications:', error);
    throw error;
  }
}

// Get distribution of application types
export async function getApplicationTypeDistribution() {
  try {
    const applications = await fetchApplications();
    return {
      fullTime: applications.filter(app => app.type === 'fullTime').length,
      partTime: applications.filter(app => app.type === 'partTime').length,
      contract: applications.filter(app => app.type === 'Contract').length,
      internship: applications.filter(app => app.type === 'Internship').length,
    };
  } catch (error) {
    console.error('Error getting application type distribution:', error);
    throw error;
  }
}

// Get overview of jobs applied last month vs this month
export async function getJobsAppliedOverview() {
  try {
    const applications = await fetchApplications();

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= lastMonth && appDate < thisMonth;
    });

    const thisMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= thisMonth;
    });

    return {
      lastMonth: {
        total: lastMonthApps.length,
        qualified: lastMonthApps.filter(app => app.status !== 'rejected').length,
        notQualified: lastMonthApps.filter(app => app.status === 'rejected').length,
      },
      thisMonth: {
        total: thisMonthApps.length,
        qualified: thisMonthApps.filter(app => app.status !== 'rejected').length,
        notQualified: thisMonthApps.filter(app => app.status === 'rejected').length,
      }
    };
  } catch (error) {
    console.error('Error getting jobs applied overview:', error);
    throw error;
  }
}

// Get impressions data (last 7 days) for applications, interviews, offers
export async function getImpressionsData() {
  try {
    const applications = await fetchApplications();

    const now = new Date();
    const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // Initialize daily data object for last 7 days
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(lastWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = {
        applications: 0,
        interviews: 0,
        offers: 0
      };
    }

    // Aggregate data into daily counts
    applications.forEach(app => {
      const appDate = new Date(app.date);
      if (appDate >= lastWeek) {
        const dateStr = appDate.toISOString().split('T')[0];
        if (dailyData[dateStr]) {
          dailyData[dateStr].applications++;
          if (app.status === 'interview') dailyData[dateStr].interviews++;
          if (app.status === 'offer') dailyData[dateStr].offers++;
        }
      }
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));
  } catch (error) {
    console.error('Error getting impressions data:', error);
    throw error;
  }
}

// Get distribution of application sources/domains
export async function getApplicationSourceDistribution() {
  try {
    const applications = await fetchApplications();
    const distribution = {};

    applications.forEach(app => {
      const source = app.source || 'Unknown';
      distribution[source] = (distribution[source] || 0) + 1;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting application source distribution:', error);
    throw error;
  }
}

// Helper function to calculate trend percentage between current and previous values
function calculateTrend(current, previous) {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const percentage = ((current - previous) / previous) * 100;
  return `${percentage >= 0 ? '+' : ''}${Math.round(percentage)}%`;
}
