import { useMemo, useRef, useState } from 'react';
import { IMG } from '../assets';
import {
  formatDateBadge,
  formatMonthYear,
  HAZARD_BANNER_DESCRIPTION,
  MONTH_FULL,
  SEVERITY_TAG_COLORS,
  TIRE_LOG_DAY_GROUPS,
  TIRELOG_CATEGORY_FILTERS,
  type EventCategory,
  type EventSeverity,
  type TireLogDayGroup,
  type TireLogSession,
} from '../data/tireLogMocks';
import './TireLogPage.css';

const CHECKPOINT_SIZE = 16;
const DATE_BADGE_H = 30;
const CHECKPOINT_TOP = (DATE_BADGE_H - CHECKPOINT_SIZE) / 2;

type DateFilter = { year: number; month: number };

function prevMonthOf(filter: DateFilter): DateFilter {
  return filter.month === 0
    ? { year: filter.year - 1, month: 11 }
    : { year: filter.year, month: filter.month - 1 };
}

function nextMonthOf(filter: DateFilter): DateFilter {
  return filter.month === 11
    ? { year: filter.year + 1, month: 0 }
    : { year: filter.year, month: filter.month + 1 };
}

function statusLogIcon(severity: EventSeverity) {
  return IMG.statusLog[severity];
}

function SessionCard({
  session,
  noMarginBottom,
}: {
  session: TireLogSession;
  noMarginBottom?: boolean;
}) {
  return (
    <article
      className={
        noMarginBottom ? 'tl-session tl-session--last' : 'tl-session'
      }
    >
      <div className="tl-session__top">
        <span className="tl-session__time">{session.time}</span>
        <img
          src={statusLogIcon(session.severity)}
          alt=""
          width={32}
          height={28}
        />
      </div>
      <div className="tl-session__loc">
        <img src={IMG.location} alt="" width={18} height={18} />
        <span>{session.location}</span>
      </div>
      <hr className="tl-session__divider" />
      {session.tags.length > 0 ? (
        <div className="tl-session__tags">
          {session.tags.map((tag, index) => {
            const colors = SEVERITY_TAG_COLORS[tag.severity];
            return (
              <span
                key={`${tag.category}-${index}`}
                className="tl-session__tag"
                style={{ background: colors.bg, color: colors.text }}
              >
                {tag.category}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="tl-session__none">No Event</p>
      )}
    </article>
  );
}

function TimelineDay({
  group,
  isLastDay,
}: {
  group: TireLogDayGroup;
  isLastDay: boolean;
}) {
  const lastIdx = group.sessions.length - 1;
  let hazardShown = false;

  return (
    <div className="tl-day">
      <div
        className="tl-day__checkpoint"
        style={{
          width: CHECKPOINT_SIZE,
          paddingTop: CHECKPOINT_TOP,
        }}
      >
        <img
          src={IMG.checkpoint}
          alt=""
          width={CHECKPOINT_SIZE}
          height={CHECKPOINT_SIZE}
        />
      </div>
      <div className={isLastDay ? 'tl-day__content tl-day__content--last' : 'tl-day__content'}>
        <div className="tl-day__badge-row" style={{ height: DATE_BADGE_H }}>
          <span className="tl-day__badge">{formatDateBadge(group.date)}</span>
        </div>
        {group.sessions.map((session, index) => {
          const showHazard = Boolean(session.hazardSummary) && !hazardShown;
          if (showHazard) hazardShown = true;
          return (
            <div key={session.id}>
              {showHazard && session.hazardSummary ? (
                <button type="button" className="tl-hazard-chip">
                  <span>{session.hazardSummary}</span>
                  <img src={IMG.chevron} alt="" width={20} height={20} />
                </button>
              ) : null}
              <SessionCard
                session={session}
                noMarginBottom={isLastDay && index === lastIdx}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TireLogPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    year: 2026,
    month: 6, // July
  });
  const [issuesEnabled, setIssuesEnabled] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | null>(
    null,
  );
  const [hazardVisible, setHazardVisible] = useState(true);
  const [reported, setReported] = useState(false);

  const prevMonth = prevMonthOf(dateFilter);

  const visibleDays = useMemo(() => {
    let groups = TIRE_LOG_DAY_GROUPS;
    if (issuesEnabled) {
      groups = groups
        .map(day => ({
          ...day,
          sessions: day.sessions.filter(
            s => s.severity === 'danger' || s.severity === 'caution',
          ),
        }))
        .filter(day => day.sessions.length > 0);
    }
    if (categoryFilter) {
      groups = groups
        .map(day => ({
          ...day,
          sessions: day.sessions.filter(s =>
            s.tags.some(t => t.category === categoryFilter),
          ),
        }))
        .filter(day => day.sessions.length > 0);
    }
    return groups;
  }, [issuesEnabled, categoryFilter]);

  const changeMonth = (next: DateFilter) => {
    setDateFilter(next);
    setHazardVisible(true);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="screen tirelog screen--pad-tabs">
      <div className="tirelog__fixed">
        <header className="tirelog__header">
          <h1>Tire Log</h1>
          <div className="tirelog__header-actions">
            <button type="button" aria-label="Bluetooth">
              <img src={IMG.bluetooth} alt="" width={30} height={30} />
            </button>
            <button type="button" aria-label="Notifications">
              <img src={IMG.notification} alt="" width={30} height={30} />
            </button>
          </div>
        </header>

        <div className="tirelog__month">
          <button
            type="button"
            className="tirelog__month-arrow"
            aria-label="Previous month"
            onClick={() => changeMonth(prevMonth)}
          >
            <img
              className="tirelog__month-arrow--left"
              src={IMG.chevronCalendar}
              alt=""
              width={20}
              height={20}
            />
          </button>
          <button type="button" className="tirelog__month-label">
            <strong>{formatMonthYear(dateFilter.year, dateFilter.month)}</strong>
            <i className="tirelog__caret" />
          </button>
          <button
            type="button"
            className="tirelog__month-arrow"
            aria-label="Next month"
            onClick={() => changeMonth(nextMonthOf(dateFilter))}
          >
            <img src={IMG.chevronCalendar} alt="" width={20} height={20} />
          </button>
        </div>

        {hazardVisible ? (
          <div className="tirelog__hazard-wrap">
            <div className="tirelog__hazard">
              <button
                type="button"
                className="tirelog__hazard-close"
                aria-label="Close"
                onClick={() => setHazardVisible(false)}
              >
                ×
              </button>
              <div className="tirelog__hazard-row">
                <img src={IMG.recurrence} alt="" width={42} height={42} />
                <div className="tirelog__hazard-text">
                  <h2>Recurring Road Hazard</h2>
                  <p>{HAZARD_BANNER_DESCRIPTION}.</p>
                  <div className="tirelog__hazard-actions">
                    <button type="button" className="tirelog__map-btn">
                      View on map
                    </button>
                    <button
                      type="button"
                      className={
                        reported
                          ? 'tirelog__report-btn tirelog__report-btn--off'
                          : 'tirelog__report-btn'
                      }
                      disabled={reported}
                      onClick={() => setReported(true)}
                    >
                      {reported ? 'Reported' : 'REPORT TO DOT'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="tirelog__filters">
        <div className="tirelog__filters-row">
          <button
            type="button"
            className={
              issuesEnabled
                ? 'tirelog__toggle tirelog__toggle--on'
                : 'tirelog__toggle'
            }
            onClick={() => setIssuesEnabled(v => !v)}
            aria-pressed={issuesEnabled}
          >
            <span
              className={
                issuesEnabled
                  ? 'tirelog__toggle-knob'
                  : 'tirelog__toggle-knob tirelog__toggle-knob--right'
              }
            />
            <span
              className={
                issuesEnabled
                  ? 'tirelog__toggle-label'
                  : 'tirelog__toggle-label tirelog__toggle-label--all'
              }
            >
              {issuesEnabled ? 'Issues' : 'All'}
            </span>
          </button>
          <span className="tirelog__filters-div" />
          <div className="tirelog__chips">
            {TIRELOG_CATEGORY_FILTERS.map(category => {
              const on = category === categoryFilter;
              return (
                <button
                  key={category}
                  type="button"
                  className={on ? 'tirelog__chip tirelog__chip--on' : 'tirelog__chip'}
                  onClick={() =>
                    setCategoryFilter(prev =>
                      prev === category ? null : category,
                    )
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="tirelog__scroll" ref={scrollRef}>
        {visibleDays.length === 0 ? (
          <p className="tirelog__empty">No events for this period</p>
        ) : (
          <div className="tirelog__timeline">
            <div className="tirelog__rail" aria-hidden />
            {visibleDays.map((group, index) => (
              <TimelineDay
                key={group.date}
                group={group}
                isLastDay={index === visibleDays.length - 1}
              />
            ))}
          </div>
        )}

        <div className="tirelog__bottom">
          <button
            type="button"
            className="tirelog__prev-month"
            onClick={() => changeMonth(prevMonth)}
          >
            Go to {MONTH_FULL[prevMonth.month]}
          </button>
          <button
            type="button"
            className="tirelog__scroll-top"
            aria-label="Scroll to top"
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              className="tirelog__scroll-top-icon"
              src={IMG.chevronCalendar}
              alt=""
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
