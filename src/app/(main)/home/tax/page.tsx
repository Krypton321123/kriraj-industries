"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  createTax,
  deleteTax,
  getAllTaxes,
  updateTax,
  Tax,
} from "@/actions/tax/actions";

const onlyNumbers = (value: string) => {
  return value.replace(/[^0-9.]/g, ""); // allows decimals too
};

export default function TaxMasterPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  const [form, setForm] = useState({
    comName: "",
    igst: "",
    cgst: "",
    sgst: "",
  });

  const loadTaxes = async () => {
    const data = await getAllTaxes();
    setTaxes(data);
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const handleSubmit = async () => {
    const res = await createTax({
      comName: form.comName,
      igst: Number(form.igst || 0),
      cgst: Number(form.cgst || 0),
      sgst: Number(form.sgst || 0),
    });

    if (res.success) {
      setForm({ comName: "", igst: "", cgst: "", sgst: "" });
      loadTaxes();
    }
  };

  const handleUpdate = async () => {
    if (!editingTax) return;

    const res = await updateTax(editingTax.taxId, {
      comName: editingTax.comName,
      igst: editingTax.igst,
      cgst: editingTax.cgst,
      sgst: editingTax.sgst,
    });

    if (res.success) {
      setEditingTax(null);
      loadTaxes();
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* FORM */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Tax Master
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={form.comName}
                onChange={(e) => setForm({ ...form, comName: e.target.value })}
                placeholder="AUTOPARTS / OIL"
              />
            </div>

            <div className="space-y-2">
              <Label>IGST (%)</Label>
              <Input
                type="text"
                value={form.igst}
                onChange={(e) =>
                  setForm({ ...form, igst: onlyNumbers(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>CGST (%)</Label>
              <Input
                type="text"
                value={form.cgst}
                onChange={(e) =>
                  setForm({ ...form, cgst: onlyNumbers(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>SGST (%)</Label>
              <Input
                type="text"
                value={form.sgst}
                onChange={(e) =>
                  setForm({ ...form, sgst: onlyNumbers(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={handleSubmit}>Add Tax</Button>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg">Tax List</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">IGST</th>
                <th className="border p-2">CGST</th>
                <th className="border p-2">SGST</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.taxId}>
                  <td className="border p-2">{tax.comName}</td>
                  <td className="border p-2">{tax.igst}%</td>
                  <td className="border p-2">{tax.cgst}%</td>
                  <td className="border p-2">{tax.sgst}%</td>
                  <td className="border p-2 flex gap-2">
                    <Button size="sm" onClick={() => setEditingTax(tax)}>
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const res = await deleteTax(tax.taxId);
                        if (res.success) loadTaxes();
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingTax} onOpenChange={() => setEditingTax(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Tax</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={editingTax?.comName || ""}
              onChange={(e) =>
                setEditingTax((prev) =>
                  prev ? { ...prev, comName: e.target.value } : prev,
                )
              }
              placeholder="Name"
            />
            <Input
              type="text"
              value={editingTax?.igst?.toString() || ""}
              onChange={(e) =>
                setEditingTax((prev) =>
                  prev
                    ? { ...prev, igst: Number(onlyNumbers(e.target.value)) }
                    : prev,
                )
              }
            />

            <Input
              type="text"
              value={editingTax?.cgst?.toString() || ""}
              onChange={(e) =>
                setEditingTax((prev) =>
                  prev
                    ? { ...prev, cgst: Number(onlyNumbers(e.target.value)) }
                    : prev,
                )
              }
            />

            <Input
              type="text"
              value={editingTax?.sgst?.toString() || ""}
              onChange={(e) =>
                setEditingTax((prev) =>
                  prev
                    ? { ...prev, sgst: Number(onlyNumbers(e.target.value)) }
                    : prev,
                )
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTax(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
