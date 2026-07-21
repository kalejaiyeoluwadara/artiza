"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";
import {
  Artisan,
  Channel,
  ChannelKind,
  channelsFor,
  vCardFor,
} from "../lib/artisans";
import { InstagramIcon, WhatsAppIcon } from "./BrandIcons";

/**
 * The full ledger of what ₦500 buys, shown in both states. Locked, the rows
 * are already there with their values masked — you can count the channels and
 * see their shape before paying, which is the honest version of a paywall.
 * Unlocked, every row becomes the action it describes.
 */
export function ContactPanel({
  artisan,
  unlocked,
}: {
  artisan: Artisan;
  unlocked: boolean;
}) {
  const channels = channelsFor(artisan);

  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="headline text-ink">Contact</h3>
        <span className="caption shrink-0">
          {unlocked
            ? `${channels.length} ways to reach them`
            : `${channels.length} channels · sealed`}
        </span>
      </div>

      <ul className="overflow-hidden rounded-2xl bg-card">
        {channels.map((channel, i) => (
          <li key={channel.kind} className={i > 0 ? "border-t border-line" : ""}>
            <ChannelRow channel={channel} unlocked={unlocked} />
          </li>
        ))}
      </ul>

      {/* Availability is unsealed on purpose — knowing when someone works is
          part of deciding whether to pay for their number at all. */}
      <dl className="mt-2.5 overflow-hidden rounded-2xl bg-card">
        <Detail icon={<Clock3 size={15} strokeWidth={2} />} label="Response">
          {artisan.contact.respondsIn}
        </Detail>
        <Detail
          icon={<CalendarDays size={15} strokeWidth={2} />}
          label="Available"
          divider
        >
          {artisan.contact.availability}
        </Detail>
      </dl>

      {unlocked ? (
        <SaveToContacts artisan={artisan} />
      ) : (
        <p className="caption mt-2.5 flex items-start gap-1.5">
          <ShieldCheck
            size={13}
            strokeWidth={2.2}
            className="mt-0.5 shrink-0 text-accent"
          />
          Details are verified on the visit and re-checked every quarter. Pay
          once and they stay open on this device.
        </p>
      )}
    </section>
  );
}

function ChannelRow({
  channel,
  unlocked,
}: {
  channel: Channel;
  unlocked: boolean;
}) {
  const icon = <ChannelIcon kind={channel.kind} />;

  const inner = (
    <>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
          unlocked ? "bg-accent-soft text-accent" : "bg-fill text-faint"
        }`}
        aria-hidden
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] font-medium text-ink">
          {channel.label}
        </span>
        <span
          className={`figure block truncate text-[0.8125rem] ${
            unlocked ? "text-sub" : "text-faint"
          }`}
        >
          {unlocked ? channel.value : maskValue(channel.value)}
        </span>
      </span>

      {unlocked ? (
        <ChevronRight
          size={17}
          strokeWidth={2.2}
          className="shrink-0 text-faint"
          aria-hidden
        />
      ) : (
        <Lock
          size={14}
          strokeWidth={2.2}
          className="shrink-0 text-faint"
          aria-hidden
        />
      )}
    </>
  );

  if (!unlocked) {
    return (
      <div
        className="flex items-center gap-3 px-3.5 py-3"
        aria-label={`${channel.label} — locked`}
      >
        {inner}
      </div>
    );
  }

  return (
    <a
      href={channel.href}
      {...(channel.external
        ? { target: "_blank", rel: "noreferrer" }
        : undefined)}
      className="pressable hover-fill flex items-center gap-3 px-3.5 py-3"
    >
      {inner}
    </a>
  );
}

function ChannelIcon({ kind }: { kind: ChannelKind }) {
  switch (kind) {
    case "whatsapp":
      return <WhatsAppIcon size={17} />;
    case "call":
      return <PhoneCall size={16} strokeWidth={2.1} />;
    case "sms":
      return <MessageSquare size={16} strokeWidth={2.1} />;
    case "instagram":
      return <InstagramIcon size={16} />;
    case "email":
      return <Mail size={16} strokeWidth={2.1} />;
    case "alt":
      return <Phone size={16} strokeWidth={2.1} />;
  }
}

/**
 * Masks the characters, keeps the punctuation — a locked email still looks
 * like an email, so nothing about the row's shape changes on unlock.
 */
function maskValue(value: string): string {
  return value.replace(/[A-Za-z0-9]/g, "•");
}

function Detail({
  icon,
  label,
  children,
  divider = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 ${
        divider ? "border-t border-line" : ""
      }`}
    >
      <span className="shrink-0 text-faint" aria-hidden>
        {icon}
      </span>
      <dt className="caption shrink-0">{label}</dt>
      <dd className="ml-auto min-w-0 truncate text-right text-[0.8125rem] font-medium text-ink">
        {children}
      </dd>
    </div>
  );
}

/**
 * A vCard, so the contact survives the browser. Built on click rather than
 * held in a data URL, so the file is only made when someone wants it.
 */
function SaveToContacts({ artisan }: { artisan: Artisan }) {
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function save() {
    const blob = new Blob([vCardFor(artisan)], {
      type: "text/vcard;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${artisan.name.replace(/\s+/g, "-").toLowerCase()}.vcf`;
    link.click();
    URL.revokeObjectURL(url);

    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={save}
      className="pressable hover-fill mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3 text-[0.9375rem] font-semibold text-accent"
    >
      {saved ? (
        <Check size={16} strokeWidth={2.4} />
      ) : (
        <UserRoundPlus size={16} strokeWidth={2.2} />
      )}
      {saved ? "Saved to your phone" : "Save to contacts"}
    </button>
  );
}

/** Copies a value with a two-second confirmation in place of the icon. */
export function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard denied — the number is on screen either way.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="pressable hover-fill flex size-8 shrink-0 items-center justify-center rounded-full text-sub"
    >
      {copied ? (
        <Check size={15} strokeWidth={2.4} className="text-accent" />
      ) : (
        <Copy size={15} strokeWidth={2.2} />
      )}
    </button>
  );
}
