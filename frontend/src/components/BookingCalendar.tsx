import { useState } from "react";

interface BookingCalendarProps {
  bookedDates: string[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

export default function BookingCalendar({
  bookedDates,
  onSelectDate,
  selectedDate,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) => {
    // Monday-based: 0=Mon … 6=Sun
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isDateBooked = (dateStr: string) => {
    const [yaer,month,day] = dateStr.split("-").map(Number);
    const currentDate = new Date(yaer,month -1, day);
    
    return bookedDates.some(d =>{
      const bookedDate = new Date(d);
      return bookedDate.toDateString() === currentDate.toDateString();
    })

  }

  const isPastDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year,month,day] = dateStr.split("-").map(Number);
    const date = new Date(year,month-1,day)

    return date < today;
  };

  const isDateAvailable = (dateStr: string) =>
    !isDateBooked(dateStr) && !isPastDate(dateStr);

  const handleDateClick = (dateStr: string) => {
    if (isDateAvailable(dateStr)) onSelectDate(dateStr);
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const weeks: React.ReactNode[] = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week: React.ReactNode[] = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          week.push(<td key={`empty-${i}-${j}`} style={{ padding: 4 }} />);
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isBooked = isDateBooked(dateStr);
          const isPast = isPastDate(dateStr);
          const isSelected = selectedDate === dateStr;
          const available = !isBooked && !isPast;

          // Style logic
          let bg = "transparent";
          let color = "var(--on-surface)";
          let cursor = "pointer";
          let border = "none";
          let opacity = 1;
          let fontWeight: number | string = 400;

          if (isSelected) {
            bg = "var(--secondary)";
            color = "#fff";
            fontWeight = 700;
          } else if (isBooked) {
            bg = "rgba(186,26,26,0.07)";
            color = "var(--error)";
            cursor = "not-allowed";
          } else if (isPast) {
            color = "var(--outline-variant)";
            cursor = "not-allowed";
            opacity = 0.5;
          } else {
            // available hover handled via onMouseEnter
          }

          week.push(
            <td key={day} style={{ padding: 3 }}>
              <button
                type="button"
                onClick={() => handleDateClick(dateStr)}
                disabled={!available}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: "none",
                  background: bg,
                  color,
                  cursor,
                  fontSize: 13,
                  fontWeight,
                  fontFamily: "inherit",
                  opacity,
                  transition: "background 0.15s, color 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: isPast ? "line-through" : "none",
                }}
                onMouseEnter={(e) => {
                  if (available && !isSelected) {
                    e.currentTarget.style.background = "rgba(108,74,178,0.1)";
                    e.currentTarget.style.color = "var(--secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (available && !isSelected) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--on-surface)";
                  }
                }}
              >
                {day}
              </button>
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{week}</tr>);
      if (day > daysInMonth) break;
    }
    return weeks;
  };

  const weekdays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

  const monthTitle = currentMonth.toLocaleString("uz-UZ", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => changeMonth(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: "1px solid var(--outline-variant)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(106,81,136,0.07)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span className="mi" style={{ fontSize: 16 }}>chevron_left</span>
        </button>

        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--on-surface)",
          }}
        >
          {monthTitle}
        </p>

        <button
          onClick={() => changeMonth(1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: "1px solid var(--outline-variant)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(106,81,136,0.07)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span className="mi" style={{ fontSize: 16 }}>chevron_right</span>
        </button>
      </div>

      {/* Calendar table */}
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--outline)",
                  paddingBottom: 10,
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      {/* Legend */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(200,185,220,0.2)",
          display: "flex",
          gap: 20,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          { bg: "var(--secondary)", label: "Tanlangan sana" },
          { bg: "rgba(186,26,26,0.1)", label: "Band kun", color: "var(--error)" },
          { bg: "rgba(200,185,220,0.2)", label: "O'tgan kun" },
        ].map(({ bg, label, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 7 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: bg,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: color ?? "var(--on-surface-variant)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}