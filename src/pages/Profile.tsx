import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Briefcase, Award, ShieldAlert, Users, Calendar } from 'lucide-react';
import { getProfile, getReportees } from '../services/api';
import type { UserProfile } from '../services/api';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reporteeCount, setReporteeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProfile(), getReportees()])
      .then(([prof, reps]) => {
        setProfile(prof);
        setReporteeCount(reps.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 w-full">
        <div className="h-40 sm:h-48 skeleton" />
        <div className="h-56 sm:h-64 skeleton" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="glass-card p-6 sm:p-8 text-center max-w-lg mx-auto mt-8 sm:mt-12">
        <ShieldAlert className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-body-sm text-on-surface-variant mb-4">{error || 'Failed to load profile'}</p>
        <button type="button" onClick={() => window.location.reload()} className="glass-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 w-full">
      <div className="relative h-28 sm:h-36 rounded-ezo-xl overflow-hidden bg-gradient-to-r from-primary/30 via-secondary/20 to-primary-container/20 border border-outline-variant/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,99,238,0.15),transparent)] animate-pulse-soft" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative z-10 -mt-16 sm:-mt-20 mx-4 sm:mx-6 border border-outline-variant/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface border border-outline-variant/30 flex items-center justify-center font-bold text-2xl sm:text-3xl text-primary shrink-0 shadow-md">
          {profile.firstName[0]}
          {profile.lastName[0]}
        </div>

        <div className="text-center sm:text-left space-y-2 min-w-0">
          <h1 className="text-headline-lg text-[var(--ezo-fg)]">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-body-sm text-on-surface-variant font-medium">
            {profile.designation} &bull; <span className="gradient-text">{profile.department}</span>
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 pt-2">
            <span className="badge badge-pending flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </span>
            <span className="badge badge-completed flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Manager: {profile.manager}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5 mx-4 sm:mx-6 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-sm font-medium text-[var(--ezo-fg)]">Team overview</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Manager: {profile.manager}
            {reporteeCount > 0 && ` · ${reporteeCount} direct report${reporteeCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link
          to="/team"
          className="text-sm font-semibold text-primary hover:underline shrink-0"
        >
          View team →
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 sm:p-8 space-y-6"
      >
        <h3 className="text-headline-md text-[var(--ezo-fg)] border-b border-outline-variant/20 pb-3">
          Account Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {[
            { icon: Mail, label: 'Email Address', value: profile.email },
            { icon: Briefcase, label: 'Department', value: profile.department },
            { icon: Award, label: 'Reporting Manager', value: profile.manager },
            ...(profile.createdAt
              ? [
                  {
                    icon: Calendar,
                    label: 'Member Since',
                    value: new Date(profile.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    }),
                  },
                ]
              : []),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="p-2.5 rounded-ezo-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-label-md text-on-surface-variant normal-case tracking-wider">{label}</p>
                <p className="text-body-sm font-medium text-[var(--ezo-fg)] mt-1 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
