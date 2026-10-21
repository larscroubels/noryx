"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox, ChoiceRow, RadioGroup, RadioGroupItem, Switch } from "@/components/ui/choice";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

export function FormDemo() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Business name" hint="Shown on your booking page." required>
        <Input placeholder="Studio Lumière" />
      </Field>
      <Field label="Email" error="Enter a valid email address." required>
        <Input type="email" defaultValue="lena@studio" />
      </Field>
      <Field label="Price" optional>
        <Input defaultValue="45,00" leading={<span className="text-sm">€</span>} />
      </Field>
      <Field label="Duration">
        <Input type="number" defaultValue={45} trailing="min" />
      </Field>
      <Field label="Category">
        <Select defaultValue="cuts">
          <option value="cuts">Cuts</option>
          <option value="colour">Colour</option>
        </Select>
      </Field>
      <Field label="Disabled">
        <Input disabled defaultValue="Read-only value" />
      </Field>
      <Field label="Notes" className="sm:col-span-2" optional>
        <Textarea placeholder="Preferences, allergies…" />
      </Field>
      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
        <ChoiceRow
          htmlFor="demo-check"
          control={<Checkbox id="demo-check" defaultChecked />}
          label="Checkbox"
          description="Multiple choices"
        />
        <ChoiceRow
          htmlFor="demo-switch"
          control={<Switch id="demo-switch" defaultChecked />}
          label="Switch"
          description="Instant on/off settings"
        />
        <RadioGroup defaultValue="a" aria-label="Radio example">
          <ChoiceRow
            htmlFor="demo-radio-a"
            control={<RadioGroupItem id="demo-radio-a" value="a" />}
            label="Radio option A"
          />
          <ChoiceRow
            htmlFor="demo-radio-b"
            control={<RadioGroupItem id="demo-radio-b" value="b" />}
            label="Radio option B"
          />
        </RadioGroup>
      </div>
    </div>
  );
}

export function OverlayDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Open dialog</Button>
        </DialogTrigger>
        <DialogContent
          title="Reschedule appointment"
          description="Choose a new time for Sofie's balayage."
        >
          <Field label="New date">
            <Input type="date" />
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Save</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" aria-label="More actions">
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Appointment</DropdownMenuLabel>
          <DropdownMenuItem>
            <Pencil /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip content="Supplementary hint — never essential information">
        <Button variant="ghost">Hover or focus me</Button>
      </Tooltip>

      <Button
        variant="secondary"
        onClick={() =>
          toast("Service saved", { description: "Changes are live on your booking page." })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast("Couldn't save", { description: "Please check your connection.", tone: "error" })
        }
      >
        Error toast
      </Button>
    </div>
  );
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="hours">Working hours</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="pt-4 text-sm text-fg-muted">
        Profile content.
      </TabsContent>
      <TabsContent value="hours" className="pt-4 text-sm text-fg-muted">
        Working hours content.
      </TabsContent>
      <TabsContent value="services" className="pt-4 text-sm text-fg-muted">
        Services content.
      </TabsContent>
    </Tabs>
  );
}
