import { Pointer } from "lucide-react";

import { cn } from "@/lib/cn";

import styles from "./hero-demo.module.css";

export type HeroDemoLabels = {
  url: string;
  nav: [string, string, string, string, string];
  weekday: string;
  greeting: string;
  stats: [string, string, string];
  rows: { time: string; name: string; service: string }[];
  newRow: { time: string; name: string; service: string; badge: string };
  popover: {
    service: string;
    detail: string;
    confirmed: string;
    completed: string;
    action: string;
  };
  phone: {
    salon: string;
    chooseService: string;
    services: { name: string; meta: string; price: string }[];
    pickTime: string;
    days: { weekday: string; day: string }[];
    slots: string[];
    confirm: string;
    successTitle: string;
    successWhen: string;
    successDetail: string;
    addToCalendar: string;
  };
  caption: string;
};

const ROW_STYLES = [
  { fill: "#fdf2f4", accent: "#b83d5d" },
  { fill: "#eef7f1", accent: "#1f7a4b" },
  { fill: "#fff7e6", accent: "#d9951a", dashed: true },
  { fill: "#fdf2f4", accent: "#b83d5d" },
] as const;

/** Decorative, animated product demo: salon dashboard + client booking on a phone. */
export function HeroDemo({ labels }: { labels: HeroDemoLabels }) {
  const rowY = [218, 266, 314, 362];
  return (
    <figure className={cn(styles.demo, "relative pr-[20%] pb-[14%]")}>
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-champagne-100/70 via-transparent to-rosegold-100/60 blur-2xl"
      />

      {/* Desktop dashboard */}
      <svg
        viewBox="0 0 640 470"
        className="relative w-full drop-shadow-[0_24px_40px_rgba(58,40,34,0.16)]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="demo-window">
            <rect x="1" y="1" width="638" height="468" rx="22" />
          </clipPath>
          <filter id="demo-pop-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="12"
              floodColor="#3a2822"
              floodOpacity="0.16"
            />
          </filter>
        </defs>
        <g clipPath="url(#demo-window)" className={styles.svgText}>
          <rect x="1" y="1" width="638" height="468" fill="#ffffff" />
          <rect x="1" y="1" width="638" height="46" fill="#f6f2ee" />
          <line x1="1" y1="47" x2="639" y2="47" stroke="#e6dfda" />
          {[26, 44, 62].map((cx) => (
            <circle key={cx} cx={cx} cy="24" r="5.5" fill="#ddd5d0" />
          ))}
          <rect x="82" y="11" width="140" height="26" rx="13" fill="#ffffff" stroke="#e6dfda" />
          <text x="97" y="28.5" fontSize="12" fill="#6e6764">
            {labels.url}
          </text>

          {/* Sidebar */}
          <rect x="1" y="47" width="150" height="422" fill="#faf7f4" />
          <line x1="151" y1="47" x2="151" y2="469" stroke="#ece6e1" />
          <image href="/brand/noryx-wordmark.png" x="18" y="66" width="96" height="14.6" />
          <rect x="14" y="137" width="124" height="27" rx="8" fill="#ffffff" stroke="#ece6e1" />
          {labels.nav.map((item, index) => (
            <text
              key={item}
              x="30"
              y={120 + index * 34}
              fontSize="13"
              fill={index === 1 ? "#292626" : "#6e6764"}
              fontWeight={index === 1 ? 600 : 400}
            >
              {item}
            </text>
          ))}

          {/* Header and stats */}
          <text x="176" y="88" fontSize="10" letterSpacing="1.6" fontWeight="600" fill="#774e3d">
            {labels.weekday}
          </text>
          <text
            x="176"
            y="121"
            fontSize="27"
            fontWeight="600"
            fill="#292626"
            className={styles.svgSerif}
          >
            {labels.greeting}
          </text>
          {[
            { x: 176, w: 138 },
            { x: 324, w: 138 },
            { x: 472, w: 144 },
          ].map((card, index) => (
            <g key={card.x}>
              <rect
                x={card.x}
                y="138"
                width={card.w}
                height="62"
                rx="12"
                fill="#ffffff"
                stroke="#e6dfda"
              />
              <text x={card.x + 14} y="160" fontSize="11" fill="#6e6764">
                {labels.stats[index]}
              </text>
            </g>
          ))}
          <text
            x="190"
            y="189"
            fontSize="22"
            fontWeight="600"
            fill="#292626"
            className={styles.statOld}
          >
            4
          </text>
          <text
            x="190"
            y="189"
            fontSize="22"
            fontWeight="600"
            fill="#292626"
            className={styles.statNew}
          >
            5
          </text>
          <text
            x="338"
            y="189"
            fontSize="22"
            fontWeight="600"
            fill="#292626"
            className={styles.statOld}
          >
            21
          </text>
          <text
            x="338"
            y="189"
            fontSize="22"
            fontWeight="600"
            fill="#292626"
            className={styles.statNew}
          >
            22
          </text>
          <text x="486" y="189" fontSize="22" fontWeight="600" fill="#292626">
            3
          </text>

          {/* Today's appointments */}
          {labels.rows.slice(0, 4).map((row, index) => {
            const style = ROW_STYLES[index]!;
            const y = rowY[index]!;
            const first = index === 0;
            return (
              <g key={row.time}>
                <rect
                  x="176"
                  y={y}
                  width="440"
                  height="40"
                  rx="10"
                  fill={style.fill}
                  className={first ? styles.rowOneFill : undefined}
                />
                {"dashed" in style ? (
                  <line
                    x1="178"
                    y1={y + 4}
                    x2="178"
                    y2={y + 36}
                    stroke={style.accent}
                    strokeWidth="4"
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                  />
                ) : (
                  <rect
                    x="176"
                    y={y}
                    width="4"
                    height="40"
                    rx="2"
                    fill={style.accent}
                    className={first ? styles.rowOneAccent : undefined}
                  />
                )}
                <text x="194" y={y + 25} fontSize="13" fontWeight="600" fill="#292626">
                  {row.time}
                </text>
                <text x="242" y={y + 25} fontSize="13" fontWeight="600" fill="#292626">
                  {row.name}
                </text>
                <text x="314" y={y + 25} fontSize="12.5" fill="#6e6764">
                  {row.service}
                </text>
              </g>
            );
          })}
          <rect
            x="175"
            y="217"
            width="442"
            height="42"
            rx="11"
            fill="none"
            stroke="#b07f69"
            strokeWidth="1.5"
            className={styles.rowFocus}
          />

          {/* The booking made on the phone appears here */}
          <g className={styles.newRow}>
            <rect x="176" y="410" width="440" height="40" rx="10" fill="#fdf2f4" />
            <rect x="176" y="410" width="4" height="40" rx="2" fill="#b83d5d" />
            <text x="194" y="435" fontSize="13" fontWeight="600" fill="#292626">
              {labels.newRow.time}
            </text>
            <text x="242" y="435" fontSize="13" fontWeight="600" fill="#292626">
              {labels.newRow.name}
            </text>
            <text x="314" y="435" fontSize="12.5" fill="#6e6764">
              {labels.newRow.service}
            </text>
            <rect x="480" y="420" width="86" height="20" rx="10" fill="#f9f3ee" stroke="#ead8c8" />
            <text x="523" y="434" fontSize="10" fontWeight="600" fill="#5b3b2e" textAnchor="middle">
              {labels.newRow.badge}
            </text>
          </g>
          <rect
            x="174"
            y="408"
            width="444"
            height="44"
            rx="12"
            fill="none"
            stroke="#c99a85"
            strokeWidth="2"
            className={styles.newRowGlow}
          />

          {/* Appointment popover */}
          <g className={styles.popover}>
            <rect
              x="296"
              y="148"
              width="240"
              height="150"
              rx="14"
              fill="#ffffff"
              stroke="#ece6e1"
              filter="url(#demo-pop-shadow)"
            />
            <text x="314" y="177" fontSize="15" fontWeight="600" fill="#292626">
              {labels.popover.service}
            </text>
            <text x="314" y="197" fontSize="11.5" fill="#6e6764">
              {labels.popover.detail}
            </text>
            <g className={styles.badgeConfirmed}>
              <rect
                x="314"
                y="210"
                width="86"
                height="22"
                rx="11"
                fill="#fdf2f4"
                stroke="#fbe3e8"
              />
              <text
                x="357"
                y="225"
                fontSize="11"
                fontWeight="600"
                fill="#b83d5d"
                textAnchor="middle"
              >
                {labels.popover.confirmed}
              </text>
            </g>
            <g className={styles.badgeCompleted}>
              <rect
                x="314"
                y="210"
                width="86"
                height="22"
                rx="11"
                fill="#eef7f1"
                stroke="#d5eddd"
              />
              <text
                x="357"
                y="225"
                fontSize="11"
                fontWeight="600"
                fill="#17603b"
                textAnchor="middle"
              >
                {labels.popover.completed}
              </text>
            </g>
            <g className={styles.buttonPress}>
              <rect x="314" y="246" width="204" height="34" rx="9" fill="#b83d5d" />
              <text
                x="416"
                y="267.5"
                fontSize="12.5"
                fontWeight="600"
                fill="#ffffff"
                textAnchor="middle"
              >
                {labels.popover.action}
              </text>
            </g>
          </g>

          {/* Click ripples and cursor */}
          <circle
            cx="332"
            cy="236"
            r="16"
            fill="#b83d5d"
            fillOpacity="0.18"
            className={styles.rippleDesktopOne}
          />
          <circle
            cx="418"
            cy="263"
            r="16"
            fill="#ffffff"
            fillOpacity="0.5"
            stroke="#b83d5d"
            strokeOpacity="0.4"
            className={styles.rippleDesktopTwo}
          />
          <g className={styles.cursor}>
            <path
              className={styles.cursorShape}
              d="M0 0 L0 19 L4.8 14.6 L8 21.6 L11 20.3 L7.8 13.4 L14.2 13.4 Z"
              fill="#292626"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>

      {/* Phone with the client booking flow */}
      <div className="absolute right-0 bottom-0 w-[30%] min-w-[118px]">
        <svg
          viewBox="0 0 230 460"
          className="w-full drop-shadow-[0_24px_36px_rgba(58,40,34,0.22)]"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="demo-screen">
              <rect x="12" y="12" width="206" height="436" rx="28" />
            </clipPath>
          </defs>
          <rect
            x="2"
            y="2"
            width="226"
            height="456"
            rx="36"
            fill="#ffffff"
            stroke="#e2d9d3"
            strokeWidth="1.5"
          />
          <g clipPath="url(#demo-screen)" className={styles.svgText}>
            <rect x="12" y="12" width="206" height="436" fill="#fbf8f5" />
            <g className={styles.phoneContent}>
              <rect x="12" y="46" width="206" height="3" fill="#c99a85" />
              <text
                x="26"
                y="76"
                fontSize="17"
                fontWeight="600"
                fill="#292626"
                className={styles.svgSerif}
              >
                {labels.phone.salon}
              </text>
              <text
                x="26"
                y="102"
                fontSize="8.5"
                letterSpacing="1.2"
                fontWeight="600"
                fill="#774e3d"
              >
                {labels.phone.chooseService}
              </text>
              {labels.phone.services.slice(0, 3).map((service, index) => {
                const y = 112 + index * 54;
                const selected = index === 2;
                return (
                  <g key={service.name}>
                    <rect
                      x="24"
                      y={y}
                      width="182"
                      height="46"
                      rx="10"
                      fill="#ffffff"
                      stroke={selected ? "#b83d5d" : "#e6dfda"}
                      strokeWidth={selected ? 1.6 : 1}
                    />
                    <text x="36" y={y + 20} fontSize="10.5" fontWeight="600" fill="#292626">
                      {service.name}
                    </text>
                    <text x="36" y={y + 35} fontSize="9" fill="#6e6764">
                      {service.meta}
                    </text>
                    <text
                      x="194"
                      y={y + 20}
                      fontSize="10"
                      fontWeight="600"
                      fill="#292626"
                      textAnchor="end"
                    >
                      {service.price}
                    </text>
                  </g>
                );
              })}
              <text
                x="26"
                y="292"
                fontSize="8.5"
                letterSpacing="1.2"
                fontWeight="600"
                fill="#774e3d"
              >
                {labels.phone.pickTime}
              </text>
              {labels.phone.days.slice(0, 5).map((day, index) => {
                const x = 24 + index * 37;
                const selected = index === 1;
                return (
                  <g key={day.day}>
                    <rect
                      x={x}
                      y="302"
                      width="32"
                      height="44"
                      rx="8"
                      fill={selected ? "#b83d5d" : "#ffffff"}
                      stroke={selected ? "#b83d5d" : "#e6dfda"}
                    />
                    <text
                      x={x + 16}
                      y="318"
                      fontSize="7.5"
                      fontWeight="600"
                      fill={selected ? "#ffffff" : "#6e6764"}
                      textAnchor="middle"
                    >
                      {day.weekday}
                    </text>
                    <text
                      x={x + 16}
                      y="336"
                      fontSize="12"
                      fontWeight="600"
                      fill={selected ? "#ffffff" : "#292626"}
                      textAnchor="middle"
                    >
                      {day.day}
                    </text>
                  </g>
                );
              })}
              {labels.phone.slots.slice(0, 6).map((slot, index) => {
                const x = 24 + (index % 3) * 64;
                const y = 362 + Math.floor(index / 3) * 36;
                const target = index === 3;
                return (
                  <g key={slot}>
                    <rect
                      x={x}
                      y={y}
                      width="54"
                      height="28"
                      rx="7"
                      fill="#ffffff"
                      stroke="#e6dfda"
                      className={target ? styles.slotFill : undefined}
                    />
                    <text
                      x={x + 27}
                      y={y + 18}
                      fontSize="10"
                      fontWeight="600"
                      fill="#292626"
                      textAnchor="middle"
                      className={target ? styles.slotText : undefined}
                    >
                      {slot}
                    </text>
                  </g>
                );
              })}
              <g className={styles.confirmPress}>
                <rect x="24" y="438" width="182" height="38" rx="10" fill="#b83d5d" />
                <text
                  x="115"
                  y="461"
                  fontSize="11.5"
                  fontWeight="600"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {labels.phone.confirm}
                </text>
              </g>
            </g>

            {/* Success screen */}
            <g className={styles.success}>
              <rect x="12" y="12" width="206" height="436" fill="#fbf8f5" />
              <g className={styles.successCheck}>
                <circle cx="115" cy="186" r="28" fill="#eef7f1" stroke="#d5eddd" strokeWidth="2" />
                <path
                  d="M102 186 L111 195 L129 177"
                  fill="none"
                  stroke="#1f7a4b"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <text
                x="115"
                y="246"
                fontSize="19"
                fontWeight="600"
                fill="#292626"
                textAnchor="middle"
                className={styles.svgSerif}
              >
                {labels.phone.successTitle}
              </text>
              <text x="115" y="268" fontSize="10.5" fill="#6e6764" textAnchor="middle">
                {labels.phone.successWhen}
              </text>
              <text x="115" y="284" fontSize="10.5" fill="#6e6764" textAnchor="middle">
                {labels.phone.successDetail}
              </text>
              <rect x="56" y="302" width="118" height="30" rx="9" fill="#ffffff" stroke="#ddd5d0" />
              <text
                x="115"
                y="321"
                fontSize="10"
                fontWeight="600"
                fill="#292626"
                textAnchor="middle"
              >
                {labels.phone.addToCalendar}
              </text>
            </g>
          </g>
          <rect x="85" y="22" width="60" height="16" rx="8" fill="#2b2828" />
        </svg>

        {/* Touch feedback and the hand */}
        <span className={cn(styles.touch, styles.touchSwipe)} />
        <span className={cn(styles.touch, styles.touchSlot)} />
        <span className={cn(styles.touch, styles.touchConfirm)} />
        <span className={styles.hand}>
          <Pointer
            className={styles.handPress}
            fill="#ffffff"
            stroke="#292626"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </span>
      </div>
      <figcaption className="sr-only">{labels.caption}</figcaption>
    </figure>
  );
}
