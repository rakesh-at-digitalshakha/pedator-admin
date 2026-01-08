"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type LearnerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: number | string;
  isBlocked?: boolean;
};

export function LearnerForm({
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: {
  initialValues: LearnerFormValues;
  onSubmit: (values: LearnerFormValues) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [values, setValues] = useState<LearnerFormValues>(initialValues);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="learner-first">First Name</Label>
          <Input
            id="learner-first"
            value={values.firstName}
            onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="learner-last">Last Name</Label>
          <Input
            id="learner-last"
            value={values.lastName}
            onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
            placeholder="Enter last name"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="learner-email">Email</Label>
        <Input
          id="learner-email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder="Enter email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="learner-mobile">Mobile</Label>
        <Input
          id="learner-mobile"
          type="tel"
          value={values.mobile}
          onChange={(e) => setValues((v) => ({ ...v, mobile: e.target.value }))}
          placeholder="Enter mobile number"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="learner-blocked">Blocked</Label>
        <Switch
          id="learner-blocked"
          checked={!!values.isBlocked}
          onCheckedChange={(checked) => setValues((v) => ({ ...v, isBlocked: checked }))}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ ...values, mobile: Number(values.mobile) })}
          disabled={
            loading || !values.firstName.trim() || !values.lastName.trim() || !values.email.trim() || !values.mobile
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
