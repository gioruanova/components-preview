import { useState, type ReactNode } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Heading, PanelTop, Pencil, Plus, Replace, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { categories } from '@/tooling/registry'
import {
  addItem,
  addSection,
  columnFractions,
  duplicateItem,
  duplicateSection,
  findItem,
  findWidgetByKey,
  headerCategory,
  HEADER_CATEGORY,
  moveItem,
  moveSection,
  removeItem,
  removeSection,
  removeSiteHeader,
  renderedColumns,
  setSiteHeader,
  type Column,
  type Item,
  type Layout,
  type Section,
} from './model'
import { headingOf, isHeadingEmpty } from './sectionHeading'
import type { Selection } from './useLayout'

type Props = {
  layout: Layout
  update: (fn: (l: Layout) => Layout) => void
  updateWithUndo: (fn: (l: Layout) => Layout, message: string) => void
  selection: Selection
  select: (s: Selection) => void
}

/** Light tint of a section's background for the scheme (handles #rrggbb and #rrggbbaa). */
const tint = (hex: string) => (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex) && hex.slice(1, 7).toLowerCase() !== 'ffffff' ? `${hex.slice(0, 7)}22` : undefined)

// Drag ids are prefixed by type so sections, columns and items never collide.
const S = (id: string) => `s:${id}`
const C = (id: string) => `c:${id}`
const I = (id: string) => `i:${id}`
const raw = (id: string | number) => String(id).slice(2)

/** Sections only collide with sections; items with items and columns (items first, so they can be reordered). */
const collision: CollisionDetection = (args) => {
  const type = args.active.data.current?.type
  const droppableContainers = args.droppableContainers.filter((c) =>
    type === 'section' ? c.data.current?.type === 'section' : c.data.current?.type !== 'section',
  )
  const scoped = { ...args, droppableContainers }
  if (type === 'section') return closestCenter(scoped)
  const hits = pointerWithin(scoped)
  const items = hits.filter((h) => String(h.id).startsWith('i:'))
  if (items.length) return items
  if (hits.length) return hits
  return closestCenter(scoped)
}

/** Editable layout scheme: drag sections to reorder, drag components within and across columns. */
export function Scheme({ layout, update, updateWithUndo, selection, select }: Props) {
  const [active, setActive] = useState<{ type: 'section' | 'item'; id: string } | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = ({ active }: DragStartEvent) => setActive({ type: active.data.current?.type, id: raw(active.id) })

  // Cross-column moves happen while dragging, so the item visibly jumps into the new column.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.data.current?.type !== 'item') return
    const itemId = raw(active.id)
    update((l) => {
      const from = findItem(l, itemId)
      if (!from) return l
      const overId = String(over.id)
      const target = overId.startsWith('c:') ? { columnId: raw(overId), index: Infinity } : (() => {
        const o = findItem(l, raw(overId))
        return o ? { columnId: o.column.id, index: o.index } : null
      })()
      if (!target || target.columnId === from.column.id) return l
      return moveItem(l, itemId, target.columnId, target.index)
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActive(null)
    if (!over) return
    if (active.data.current?.type === 'section') {
      update((l) => {
        const from = l.sections.findIndex((s) => S(s.id) === active.id)
        const to = l.sections.findIndex((s) => S(s.id) === over.id)
        return from < 0 || to < 0 || from === to ? l : moveSection(l, from, to)
      })
      return
    }
    // same-column reorder
    update((l) => {
      const from = findItem(l, raw(active.id))
      const to = String(over.id).startsWith('i:') ? findItem(l, raw(over.id)) : null
      if (!from || !to || from.column.id !== to.column.id || from.index === to.index) return l
      return moveItem(l, from.item.id, to.column.id, to.index)
    })
  }

  const activeItem = active?.type === 'item' ? findItem(layout, active.id)?.item : null
  const activeSection = active?.type === 'section' ? layout.sections.find((s) => s.id === active.id) : null

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <HeaderSlot
        layout={layout}
        selected={selection?.type === 'siteHeader'}
        onPick={(key) => {
          const widget = findWidgetByKey(key)
          if (!widget) return
          update((l) => setSiteHeader(l, widget).layout)
          select({ type: 'siteHeader' })
        }}
        onEdit={() => select({ type: 'siteHeader' })}
        onRemove={() => {
          if (selection?.type === 'siteHeader') select(null)
          updateWithUndo(removeSiteHeader, 'Header removed')
        }}
      />
      <SortableContext items={layout.sections.map((s) => S(s.id))} strategy={verticalListSortingStrategy}>
        <ol className="space-y-3" aria-label="Sections">
          {layout.sections.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              index={i}
              selection={selection}
              select={select}
              onAdd={(columnId, widgetKey) => {
                const widget = findWidgetByKey(widgetKey)
                if (!widget) return
                const r = addItem(layout, columnId, widget)
                update(() => r.layout)
                select({ type: 'item', id: r.item.id })
              }}
              onDuplicate={() => update((l) => duplicateSection(l, section.id))}
              onRemove={() => {
                if (selection?.type === 'section' && selection.id === section.id) select(null)
                updateWithUndo((l) => removeSection(l, section.id), `"${section.settings.name}" removed`)
              }}
              onItemDuplicate={(id) => update((l) => duplicateItem(l, id))}
              onItemRemove={(id) => {
                if (selection?.type === 'item' && selection.id === id) select(null)
                updateWithUndo((l) => removeItem(l, id), 'Component removed')
              }}
            />
          ))}
        </ol>
      </SortableContext>

      <Button
        variant="outline"
        className="mt-3 w-full border-dashed border-brand-blue/50 text-brand-blue hover:bg-brand-sky/50 hover:text-brand-navy"
        onClick={() => {
          const next = addSection(layout)
          update(() => next)
          select({ type: 'section', id: next.sections.at(-1)!.id })
        }}
      >
        <Plus /> Add section
      </Button>

      <DragOverlay dropAnimation={null}>
        {activeItem && <ItemChipView item={activeItem} overlay />}
        {activeSection && (
          <div className="rounded-xl border-2 border-brand-blue bg-card px-4 py-3 font-semibold shadow-xl">{activeSection.settings.name}</div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

/** The section's optional heading/description (rendered above its columns wrapper). */
function HeadingRow({ section, selected, onEdit }: { section: Section; selected: boolean; onEdit: () => void }) {
  const h = headingOf(section)
  const on = !isHeadingEmpty(h)
  const parts = [h.showHeading && h.headingLevel.toUpperCase(), h.showDescription && 'description'].filter(Boolean).join(' + ')
  return (
    <div
      className={cn(
        'mx-2 mt-2 flex items-center gap-1.5 rounded-md border px-1.5 py-1',
        on ? 'border-brand-green/50 bg-brand-green/5' : 'border-dashed bg-muted/30',
        selected && 'ring-2 ring-brand-blue',
      )}
    >
      <Heading className={cn('ml-1 size-3.5 shrink-0', on ? 'text-[#2e7d32]' : 'text-muted-foreground')} />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 truncate text-left text-xs">
        <span className="font-semibold">Heading</span>
        <span className="text-muted-foreground"> · {on ? `${parts} · “${h.showHeading ? h.heading : h.description}”` : 'none (optional, above the columns)'}</span>
      </button>
      <IconAction label={`Edit heading of ${section.settings.name}`} onClick={onEdit} small>
        <Pencil />
      </IconAction>
    </div>
  )
}

type SectionCardProps = {
  section: Section
  index: number
  selection: Selection
  select: (s: Selection) => void
  onAdd: (columnId: string, widgetKey: string) => void
  onDuplicate: () => void
  onRemove: () => void
  onItemDuplicate: (id: string) => void
  onItemRemove: (id: string) => void
}

function SectionCard({ section, index, selection, select, onAdd, onDuplicate, onRemove, onItemDuplicate, onItemRemove }: SectionCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: S(section.id),
    data: { type: 'section' },
  })
  const selected = selection?.type === 'section' && selection.id === section.id
  const fractions = columnFractions(section.settings)
  const rendered = new Set(renderedColumns(section).map((c) => c.column.id))
  const s = section.settings

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('rounded-xl border bg-card shadow-sm transition-shadow', selected && 'ring-2 ring-brand-blue', isDragging && 'opacity-40')}
    >
      <div className="flex items-center gap-1 border-b px-2 py-2">
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag ${s.name}`}
          className="grid size-8 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={() => select({ type: 'section', id: section.id })} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold">
            <span className="mr-1.5 text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
            {s.name}
          </span>
          <span className="block text-xs text-muted-foreground">
            {s.columns} column{s.columns > 1 ? 's' : ''}
            {s.columns > 1 && ` · ${fractions.join(':')}`} · {s.containerWidth === 'full' ? 'Full width' : `Boxed ${s.containerMaxWidth}px`}
          </span>
        </button>
        <IconAction label="Edit section" onClick={() => select({ type: 'section', id: section.id })}>
          <Pencil />
        </IconAction>
        <IconAction label="Duplicate section" onClick={onDuplicate}>
          <Copy />
        </IconAction>
        <IconAction label="Delete section" onClick={onRemove} danger>
          <Trash2 />
        </IconAction>
      </div>

      <HeadingRow section={section} selected={selection?.type === 'heading' && selection.id === section.id} onEdit={() => select({ type: 'heading', id: section.id })} />
      <div className="flex gap-2 p-2" style={{ background: tint(s.containerBgColor) }}>
        {section.columns.map((col, i) => (
          <ColumnDrop key={col.id} column={col} index={i} grow={fractions[i] ?? 1} hidden={!rendered.has(col.id)}>
            {col.items.map((item) => (
              <ItemChip
                key={item.id}
                item={item}
                selected={selection?.type === 'item' && selection.id === item.id}
                onEdit={() => select({ type: 'item', id: item.id })}
                onDuplicate={() => onItemDuplicate(item.id)}
                onRemove={() => onItemRemove(item.id)}
              />
            ))}
            <AddComponent onAdd={(key) => onAdd(col.id, key)} />
          </ColumnDrop>
        ))}
      </div>
    </li>
  )
}

/** `hidden`: empty while another column has content → not rendered, the other columns take its width. */
function ColumnDrop({ column, index, grow, hidden, children }: { column: Column; index: number; grow: number; hidden: boolean; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: C(column.id), data: { type: 'column' } })
  return (
    <div
      ref={setNodeRef}
      style={{ flexGrow: grow, flexBasis: 0 }}
      className={cn('flex min-w-0 flex-col gap-1.5 rounded-lg border border-dashed border-border bg-muted/40 p-1.5 transition-colors', isOver && 'border-brand-blue bg-brand-sky/50')}
    >
      <span className="px-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        Col {index + 1}
        {hidden && <span className="font-normal tracking-normal normal-case" title="Empty columns are not rendered: the other columns take the full width"> · empty, hidden</span>}
      </span>
      <SortableContext items={column.items.map((i) => I(i.id))} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  )
}

function ItemChip({ item, selected, onEdit, onDuplicate, onRemove }: { item: Item; selected: boolean; onEdit: () => void; onDuplicate: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: I(item.id), data: { type: 'item' } })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && 'opacity-40')}>
      <ItemChipView
        item={item}
        selected={selected}
        handle={
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label="Drag component"
            className="grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        }
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
      />
    </div>
  )
}

function ItemChipView({
  item,
  selected,
  overlay,
  handle,
  onEdit,
  onDuplicate,
  onRemove,
}: {
  item: Item
  selected?: boolean
  overlay?: boolean
  handle?: ReactNode
  onEdit?: () => void
  onDuplicate?: () => void
  onRemove?: () => void
}) {
  const widget = findWidgetByKey(item.widget)
  const Icon = categories.find((c) => c.slug === widget?.categorySlug)?.icon
  return (
    <div
      className={cn(
        'group/chip relative flex items-center gap-1 rounded-md border bg-card px-1 py-1 shadow-xs',
        selected && 'border-brand-blue ring-1 ring-brand-blue',
        overlay && 'w-56 shadow-lg ring-2 ring-brand-blue',
      )}
    >
      {handle ?? <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />}
      <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
        {Icon && <Icon className="size-3.5 shrink-0 text-brand-blue" />}
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium">{widget?.name ?? 'Unknown'}</span>
          <span className="block truncate font-mono text-[10px] text-muted-foreground">#{String(item.config.widgetId ?? '')}</span>
        </span>
      </button>
      {/* Actions float over the name on hover/focus (always shown when selected), so narrow columns stay readable */}
      {!overlay && (
        <span
          className={cn(
            'absolute top-1/2 right-1 hidden -translate-y-1/2 items-center rounded-md bg-card/95 shadow-sm ring-1 ring-border group-focus-within/chip:flex group-hover/chip:flex',
            selected && 'flex',
          )}
        >
          <IconAction label="Edit component" onClick={onEdit} small>
            <Pencil />
          </IconAction>
          <IconAction label="Duplicate component" onClick={onDuplicate} small>
            <Copy />
          </IconAction>
          <IconAction label="Remove component" onClick={onRemove} small danger>
            <Trash2 />
          </IconAction>
        </span>
      )}
    </div>
  )
}

/** Top slot of the page: only Header components can be placed here (and they can't go in columns). */
function HeaderSlot({ layout, selected, onPick, onEdit, onRemove }: { layout: Layout; selected: boolean; onPick: (key: string) => void; onEdit: () => void; onRemove: () => void }) {
  const item = layout.siteHeader
  const widget = item && findWidgetByKey(item.widget)
  return (
    <div
      className={cn(
        'mb-3 flex items-center gap-2 rounded-xl border p-2',
        item ? 'border-[#8e44ad]/40 bg-[#8e44ad]/5' : 'border-dashed border-[#8e44ad]/50 bg-card',
        selected && 'ring-2 ring-brand-blue',
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#8e44ad]/10 text-[#8e44ad]">
        <PanelTop className="size-4" />
      </span>
      {item && widget ? (
        <>
          <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">Header</span>
            <span className="block truncate text-sm font-semibold">{widget.name}</span>
          </button>
          <IconAction label="Edit header" onClick={onEdit}>
            <Pencil />
          </IconAction>
          <HeaderPicker onPick={onPick} current={item.widget}>
            <Button variant="ghost" size="icon" className="size-8" aria-label="Change header">
              <Replace />
            </Button>
          </HeaderPicker>
          <IconAction label="Remove header" onClick={onRemove} danger>
            <Trash2 />
          </IconAction>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Header</span>
            <span className="block text-xs text-muted-foreground">Empty · only header components can go here</span>
          </span>
          <HeaderPicker onPick={onPick}>
            <Button variant="outline" size="sm" className="border-dashed border-[#8e44ad]/50 text-[#8e44ad]">
              <Plus /> Add header
            </Button>
          </HeaderPicker>
        </>
      )}
    </div>
  )
}

/** Lists the Header category only (planned ones shown as "soon"). */
function HeaderPicker({ onPick, current, children }: { onPick: (key: string) => void; current?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const category = headerCategory()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">Choose a header</p>
        {category?.widgets.map((w) => {
          const key = `${w.categorySlug}/${w.slug}`
          return (
            <button
              key={w.slug}
              type="button"
              onClick={() => {
                onPick(key)
                setOpen(false)
              }}
              className={cn('block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted', key === current && 'bg-brand-sky/60')}
            >
              {w.name}
              <span className="block text-xs text-muted-foreground">{w.summary}</span>
            </button>
          )
        })}
        {category?.upcomingWidgets.map((w) => (
          <div key={w.slug} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground" aria-disabled="true">
            {w.name}
            <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-bold text-[#b4470e] uppercase">Soon</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

function AddComponent({ onAdd }: { onAdd: (widgetKey: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-md border border-dashed border-brand-blue/40 py-1.5 text-xs font-medium text-brand-blue transition-colors hover:bg-brand-sky/60"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">Add component</p>
        {/* header components only go in the header slot */}
        {categories.filter((c) => c.slug !== HEADER_CATEGORY && c.widgets.length > 0).map((c) => {
          const Icon = c.icon
          return (
            <div key={c.slug} className="py-1">
              <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-brand-navy">
                {Icon && <Icon className="size-3.5" />} {c.name}
              </p>
              {c.widgets.map((w) => (
                <button
                  key={w.slug}
                  type="button"
                  onClick={() => {
                    onAdd(`${w.categorySlug}/${w.slug}`)
                    setOpen(false)
                  }}
                  className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  {w.name}
                  <span className="block text-xs text-muted-foreground">{w.summary}</span>
                </button>
              ))}
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

function IconAction({ label, onClick, children, danger, small }: { label: string; onClick?: () => void; children: ReactNode; danger?: boolean; small?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className={cn(small ? 'size-6 [&_svg]:size-3.5' : 'size-8', danger && 'hover:bg-destructive/10 hover:text-destructive')}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
