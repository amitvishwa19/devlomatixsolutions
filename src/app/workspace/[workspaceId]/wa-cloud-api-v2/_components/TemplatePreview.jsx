import { Phone, ExternalLink, ChevronRight, Reply, ClipboardList } from "lucide-react";
import { getHeader, getBody, getFooter, getButtons, getCarousel } from "../_lib/templateGallery";

// WhatsApp-style chat bubble preview for a template definition.
// Pure presentation — no business logic.
export function TemplatePreview({ components = [], compact = false }) {
  const header = getHeader(components);
  const body = getBody(components);
  const footer = getFooter(components);
  const buttons = getButtons(components);
  const carousel = getCarousel(components);

  return (
    <div
      className={`mx-auto w-full max-w-sm rounded-2xl bg-[hsl(var(--muted))] p-3 text-sm shadow-soft ring-1 ring-border ${
        compact ? "" : "min-h-[260px]"
      }`}
    >
      <div className="rounded-xl bg-card p-3 shadow-sm ring-1 ring-border/60">
        {header && <HeaderBlock header={header} />}
        {body && (
          <p className="mt-2 whitespace-pre-wrap break-words text-foreground">
            {body.text}
          </p>
        )}
        {footer && (
          <p className="mt-2 text-[11px] text-muted-foreground">{footer.text}</p>
        )}

        {!!buttons.length && (
          <div className="mt-3 space-y-1.5 border-t border-border/60 pt-2">
            {buttons.map((b, i) => (
              <ButtonRow key={i} button={b} />
            ))}
          </div>
        )}

        {carousel && <CarouselBlock cards={carousel.cards || []} />}
      </div>
    </div>
  );
}

function HeaderBlock({ header }) {
  const fmt = String(header.format || "TEXT").toUpperCase();
  if (fmt === "TEXT") {
    return <p className="mb-1 text-sm font-semibold text-foreground">{header.text}</p>;
  }
  if (fmt === "IMAGE") {
    return (
      <div className="flex h-32 items-center justify-center rounded-md bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
        Image header
      </div>
    );
  }
  if (fmt === "VIDEO") {
    return (
      <div className="flex h-32 items-center justify-center rounded-md bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
        Video header
      </div>
    );
  }
  if (fmt === "DOCUMENT") {
    return (
      <div className="flex h-16 items-center gap-2 rounded-md bg-muted/60 px-3 text-xs text-muted-foreground">
        📄 Document header
      </div>
    );
  }
  return null;
}

function ButtonRow({ button }) {
  const type = String(button.type || "").toUpperCase();
  if (type === "URL") {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/40 py-1.5 text-xs font-medium text-primary">
        <ExternalLink className="h-3.5 w-3.5" /> {button.text}
      </div>
    );
  }
  if (type === "PHONE_NUMBER") {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/40 py-1.5 text-xs font-medium text-primary">
        <Phone className="h-3.5 w-3.5" /> {button.text}
      </div>
    );
  }
  if (type === "QUICK_REPLY") {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/40 py-1.5 text-xs font-medium text-primary">
        <Reply className="h-3.5 w-3.5" /> {button.text}
      </div>
    );
  }
  if (type === "FLOW") {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-md bg-primary/10 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20">
        <ClipboardList className="h-3.5 w-3.5" /> {button.text}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-md bg-muted/40 py-1.5 text-xs font-medium text-primary">
      <ChevronRight className="h-3.5 w-3.5" /> {button.text || type}
    </div>
  );
}

function CarouselBlock({ cards }) {
  if (!cards.length) return null;
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {cards.map((card, i) => (
        <div
          key={i}
          className="min-w-[160px] max-w-[160px] flex-shrink-0 rounded-lg bg-muted/40 p-2 ring-1 ring-border/60"
        >
          <div className="flex h-20 items-center justify-center rounded-md bg-muted/60 text-[10px] text-muted-foreground">
            Image
          </div>
          <p className="mt-1.5 line-clamp-2 text-[11px] text-foreground">
            {getBody(card.components || [])?.text || "Card body"}
          </p>
          {!!getButtons(card.components || []).length && (
            <div className="mt-1 rounded-md bg-card py-1 text-center text-[10px] font-medium text-primary ring-1 ring-border/60">
              {getButtons(card.components || [])[0].text}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
