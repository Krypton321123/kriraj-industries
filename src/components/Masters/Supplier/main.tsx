// app/supplier/main.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useCityState } from "@/hooks/useCityState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { City } from "country-state-city";
import { useEditContext } from "@/contexts/editContext";
import { 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  type SupplierInput,
  type Supplier 
} from "@/actions/masters/supplier/actions";
import { useRouter } from "next/navigation";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Save, X, Trash2, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Select = dynamic(() => import("react-select"), { ssr: false });

interface MainProps {
  initialSuppliers: Supplier[];
}

export default function Main({ initialSuppliers }: MainProps) {
  const router = useRouter();
  
  const { editing, editingId, setEditing, setEditingId, editingFor, setEditingFor } = useEditContext();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(true);
  
  const [data, setData] = useState<Supplier[]>(initialSuppliers || []);
  
  const [inputData, setInputData] = useState({
    supplierName: "",
    supplierCode: "NEW",
    supplierAddress: "",
    city: "",
    state: "",
    mobileNumber: "",
    openingBalance: "",
    createdBy: "",
    gstNumber: "",
    aadharNumber: "",
    panNumber: "",
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    ifscCode: "",
    status: "active" as "active" | "inactive",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    states,
    setSelectedState,
    cities,
    setSelectedCity,
    selectedCity,
    selectedState,
  } = useCityState();

  useEffect(() => {
    if (editing && editingId && editingFor === 'SUPPLIER') {
      const row = data.find((item) => item.supplierCode === editingId);
      if (!row) {
        toast.error("Supplier not found");
        setEditing(false);
        setEditingId(null);
        return;
      }
      
      const selectedState1 = states.find((item) => item.value === row.state);
      if (selectedState1) {
        setSelectedState({
          value: selectedState1.value,
          label: selectedState1.label,
          code: selectedState1.code,
        });

        setTimeout(() => {
          const stateCities = City.getCitiesOfState("IN", selectedState1.code || "");
          const selectedCity1 = stateCities.find((item) => item.name === row.city);
          if (selectedCity1) {
            setSelectedCity({
              value: selectedCity1.name,
              label: selectedCity1.name,
            });
          }
        }, 100);
      }

      setInputData({
        supplierName: row.supplierName,
        supplierCode: row.supplierCode,
        supplierAddress: row.supplierAddress,
        city: row.city,
        state: row.state,
        mobileNumber: row.mobileNumber,
        openingBalance: row.openingBalance,
        createdBy: row.createdBy,
        gstNumber: row.gstNumber,
        aadharNumber: row.aadharNumber || "",
        panNumber: row.panNumber || "",
        bankName: row.bankName || "",
        bankBranch: row.bankBranch || "",
        accountNumber: row.accountNumber || "",
        ifscCode: row.ifscCode || "",
        status: (row.status || "active") as "active" | "inactive",
      });
      
      setIsFormOpen(true);
    } else {
      setInputData(prev => ({ ...prev, supplierCode: "NEW" }));
    }
  }, [editing, editingId, data, states]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!inputData.supplierName.trim()) newErrors.supplierName = "Supplier name is required";
    if (!inputData.supplierAddress.trim()) newErrors.supplierAddress = "Address is required";
    if (!inputData.state) newErrors.state = "State is required";
    if (!inputData.city) newErrors.city = "City is required";
    if (!inputData.mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(inputData.mobileNumber)) newErrors.mobileNumber = "Mobile must be 10 digits";
    if (!inputData.openingBalance) newErrors.openingBalance = "Opening balance is required";
    else if (isNaN(parseFloat(inputData.openingBalance))) newErrors.openingBalance = "Must be a valid number";
    if (!inputData.createdBy.trim()) newErrors.createdBy = "Created by is required";
    if (!inputData.gstNumber.trim()) newErrors.gstNumber = "GST number is required";
    
    // Optional field validations
    if (inputData.aadharNumber && !/^\d{12}$/.test(inputData.aadharNumber)) {
      newErrors.aadharNumber = "Aadhar must be 12 digits";
    }
    if (inputData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(inputData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (inputData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(inputData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC code format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNew = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    startTransition(async () => {
      try {
        const dataToSubmit: SupplierInput = {
          supplierName: inputData.supplierName.trim(),
          supplierAddress: inputData.supplierAddress.trim(),
          city: inputData.city,
          state: inputData.state,
          mobileNumber: inputData.mobileNumber.trim(),
          openingBalance: inputData.openingBalance,
          createdBy: inputData.createdBy.trim(),
          gstNumber: inputData.gstNumber.trim().toUpperCase(),
          aadharNumber: inputData.aadharNumber.trim(),
          panNumber: inputData.panNumber.trim().toUpperCase(),
          bankName: inputData.bankName.trim(),
          bankBranch: inputData.bankBranch.trim(),
          accountNumber: inputData.accountNumber.trim(),
          ifscCode: inputData.ifscCode.trim().toUpperCase(),
          status: inputData.status,
        };

        if (editing && editingId) {
          const result = await updateSupplier(editingId, dataToSubmit);
          
          if (result.success && result.data) {
            setData(prev => 
              prev.map(item => 
                item.supplierCode === editingId ? result.data : item
              )
            );
            toast.success("Supplier updated successfully");
            setEditing(false);
            setEditingId(null);
            resetForm();
          } else {
            if ('issues' in result && result.issues) {
              result.issues.forEach((issue: any) => {
                toast.error(`${issue.field}: ${issue.message}`);
              });
            } else {
              toast.error(result.error || "Failed to update supplier");
            }
          }
        } else {
          const result = await createSupplier(dataToSubmit);
          
          if (result.success && result.data) {
            setData(prev => [result.data, ...prev]);
            toast.success(
              <div className="flex flex-col">
                <span>Supplier created successfully!</span>
                <span className="font-mono text-sm mt-1">ID: {result.data.supplierCode}</span>
              </div>
            );
            resetForm();
          } else {
            if ('issues' in result && result.issues) {
              result.issues.forEach((issue: any) => {
                toast.error(`${issue.field}: ${issue.message}`);
              });
            } else {
              toast.error(result.error || "Failed to create supplier");
            }
          }
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error(error);
      }
    });
  };

  const confirmDelete = (supplierCode: string) => {
    setSupplierToDelete(supplierCode);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    if (!supplierToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteSupplier(supplierToDelete);
      
      if (result.success) {
        setData(prev => prev.filter(item => item.supplierCode !== supplierToDelete));
        toast.success("Supplier deleted successfully");
        
        if (editingId === supplierToDelete) {
          setEditing(false);
          setEditingId(null);
          resetForm();
        }
      } else {
        toast.error(result.error || "Failed to delete supplier");
      }
      
      setShowDeleteDialog(false);
      setSupplierToDelete("");
    });
  };

  const resetForm = () => {
    setInputData({
      supplierName: "",
      supplierCode: "NEW",
      supplierAddress: "",
      city: "",
      state: "",
      mobileNumber: "",
      openingBalance: "",
      createdBy: "",
      gstNumber: "",
      aadharNumber: "",
      panNumber: "",
      bankName: "",
      bankBranch: "",
      accountNumber: "",
      ifscCode: "",
      status: "active",
    });
    setSelectedState(null);
    setSelectedCity(null);
    setEditing(false);
    setEditingId(null);
    setErrors({});
  };

  const handleInputChange = (key: string, value: string) => {
    setInputData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  const handleEdit = (supplierCode: string) => {
    setEditingId(supplierCode);
    setEditing(true);
    setIsFormOpen(true);
    setEditingFor('SUPPLIER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-6 p-4 max-w-full overflow-y-scroll max-h-[90vh] overflow-x-hidden">
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-semibold">
                  Supplier Information
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {editing && editingId ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <Edit3 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">Editing supplier:</span>
                      <Badge variant="secondary" className="font-mono">{editingId}</Badge>
                    </span>
                  ) : (
                    "Fill in the details to create a new supplier record"
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Cancel Edit</span>
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    {isFormOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle form</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <Separator />
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Supplier Code - Read Only */}
                <div className="space-y-2">
                  <Label htmlFor="supplierCode" className="text-sm font-medium">
                    Supplier Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="supplierCode"
                      value={inputData.supplierCode}
                      disabled
                      className="font-mono bg-gray-50 cursor-not-allowed pr-16"
                    />
                    {!editing && (
                      <Badge 
                        variant="secondary" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                      >
                        AUTO
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {editing ? "Cannot be modified" : "Will be generated automatically"}
                  </p>
                </div>

                {/* Supplier Name */}
                <div className="space-y-2">
                  <Label htmlFor="supplierName" className="text-sm font-medium">
                    Supplier Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="supplierName"
                    value={inputData.supplierName}
                    onChange={(e) => handleInputChange("supplierName", e.target.value)}
                    placeholder="Enter supplier name"
                    disabled={isPending}
                    className={errors.supplierName ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.supplierName && (
                    <p className="text-xs text-red-500">{errors.supplierName}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <ShadSelect
                    value={inputData.status}
                    onValueChange={(value: any) => handleInputChange("status", value)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </ShadSelect>
                </div>

                {/* Supplier Address */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="supplierAddress" className="text-sm font-medium">
                    Supplier Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="supplierAddress"
                    value={inputData.supplierAddress}
                    onChange={(e) => handleInputChange("supplierAddress", e.target.value)}
                    placeholder="Enter complete address"
                    disabled={isPending}
                    className={errors.supplierAddress ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.supplierAddress && (
                    <p className="text-xs text-red-500">{errors.supplierAddress}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="state"
                    onChange={(value: any) => {
                      handleInputChange("state", value?.value || "");
                      setSelectedState(value);
                      setSelectedCity(null);
                      handleInputChange("city", "");
                    }}
                    isSearchable
                    isClearable
                    value={selectedState}
                    options={states}
                    isDisabled={isPending}
                    placeholder="Select state..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "#fff",
                        borderColor: errors.state ? "#ef4444" : state.isFocused ? "#3b82f6" : "#e5e7eb",
                        borderWidth: "1px",
                        borderRadius: "0.375rem",
                        padding: "1px",
                        boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
                        minHeight: "40px",
                        "&:hover": {
                          borderColor: state.isFocused ? "#3b82f6" : "#d1d5db"
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#fff",
                        borderRadius: "0.375rem",
                        marginTop: "4px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        zIndex: 50,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
                        color: "#111827",
                        padding: "8px 12px",
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: "#e5e7eb"
                        }
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#111827",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9ca3af",
                      }),
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-500">{errors.state}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="city"
                    onChange={(value: any) => {
                      handleInputChange("city", value?.value || "");
                      setSelectedCity(value);
                    }}
                    isSearchable
                    isClearable
                    options={cities || []}
                    value={selectedCity}
                    isDisabled={!selectedState || isPending}
                    placeholder={selectedState ? "Select city..." : "Select state first"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled ? "#f9fafb" : "#fff",
                        borderColor: errors.city ? "#ef4444" : state.isFocused ? "#3b82f6" : "#e5e7eb",
                        borderWidth: "1px",
                        borderRadius: "0.375rem",
                        padding: "1px",
                        boxShadow: state.isFocused && !state.isDisabled ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
                        minHeight: "40px",
                        opacity: state.isDisabled ? 0.6 : 1,
                        cursor: state.isDisabled ? "not-allowed" : "default",
                        "&:hover": {
                          borderColor: state.isDisabled ? "#e5e7eb" : state.isFocused ? "#3b82f6" : "#d1d5db"
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#fff",
                        borderRadius: "0.375rem",
                        marginTop: "4px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        zIndex: 50,
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
                        color: "#111827",
                        padding: "8px 12px",
                        cursor: "pointer",
                        "&:active": {
                          backgroundColor: "#e5e7eb"
                        }
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#111827",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9ca3af",
                      }),
                    }}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-sm font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    value={inputData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange("mobileNumber", value);
                    }}
                    placeholder="10 digit mobile number"
                    disabled={isPending}
                    maxLength={10}
                    className={errors.mobileNumber ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-red-500">{errors.mobileNumber}</p>
                  )}
                </div>

                {/* Opening Balance */}
                <div className="space-y-2">
                  <Label htmlFor="openingBalance" className="text-sm font-medium">
                    Opening Balance (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    step="0.01"
                    value={inputData.openingBalance}
                    onChange={(e) => handleInputChange("openingBalance", e.target.value)}
                    placeholder="0.00"
                    disabled={isPending}
                    className={errors.openingBalance ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.openingBalance && (
                    <p className="text-xs text-red-500">{errors.openingBalance}</p>
                  )}
                </div>

                {/* Created By */}
                <div className="space-y-2">
                  <Label htmlFor="createdBy" className="text-sm font-medium">
                    Created By <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="createdBy"
                    value={inputData.createdBy}
                    onChange={(e) => handleInputChange("createdBy", e.target.value)}
                    placeholder="Enter your name"
                    disabled={isPending}
                    className={errors.createdBy ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.createdBy && (
                    <p className="text-xs text-red-500">{errors.createdBy}</p>
                  )}
                </div>

                {/* GST Number */}
                <div className="space-y-2">
                  <Label htmlFor="gstNumber" className="text-sm font-medium">
                    GST Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gstNumber"
                    value={inputData.gstNumber}
                    onChange={(e) => handleInputChange("gstNumber", e.target.value.toUpperCase())}
                    placeholder="15 character GST number"
                    disabled={isPending}
                    maxLength={15}
                    className={errors.gstNumber ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.gstNumber && (
                    <p className="text-xs text-red-500">{errors.gstNumber}</p>
                  )}
                </div>

                {/* Aadhar Number */}
                <div className="space-y-2">
                  <Label htmlFor="aadharNumber" className="text-sm font-medium">
                    Aadhar Number
                  </Label>
                  <Input
                    id="aadharNumber"
                    value={inputData.aadharNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                      handleInputChange("aadharNumber", value);
                    }}
                    placeholder="12 digit Aadhar number"
                    disabled={isPending}
                    maxLength={12}
                    className={errors.aadharNumber ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.aadharNumber && (
                    <p className="text-xs text-red-500">{errors.aadharNumber}</p>
                  )}
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <Label htmlFor="panNumber" className="text-sm font-medium">
                    PAN Number
                  </Label>
                  <Input
                    id="panNumber"
                    value={inputData.panNumber}
                    onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    disabled={isPending}
                    maxLength={10}
                    className={errors.panNumber ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.panNumber && (
                    <p className="text-xs text-red-500">{errors.panNumber}</p>
                  )}
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm font-medium">
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    value={inputData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    placeholder="Enter bank name"
                    disabled={isPending}
                  />
                </div>

                {/* Bank Branch */}
                <div className="space-y-2">
                  <Label htmlFor="bankBranch" className="text-sm font-medium">
                    Bank Branch
                  </Label>
                  <Input
                    id="bankBranch"
                    value={inputData.bankBranch}
                    onChange={(e) => handleInputChange("bankBranch", e.target.value)}
                    placeholder="Enter branch name"
                    disabled={isPending}
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-sm font-medium">
                    Account Number
                  </Label>
                  <Input
                    id="accountNumber"
                    value={inputData.accountNumber}
                    onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                    placeholder="Enter account number"
                    disabled={isPending}
                  />
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <Label htmlFor="ifscCode" className="text-sm font-medium">
                    IFSC Code
                  </Label>
                  <Input
                    id="ifscCode"
                    value={inputData.ifscCode}
                    onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                    placeholder="ABCD0123456"
                    disabled={isPending}
                    maxLength={11}
                    className={errors.ifscCode ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.ifscCode && (
                    <p className="text-xs text-red-500">{errors.ifscCode}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <Separator className="my-6" />
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isPending || isDeleting}
                  className="min-w-[100px]"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  {editing ? 'Cancel' : 'Clear'}
                </Button>
                
                {editing && editingId && (
                  <Button
                    variant="destructive"
                    onClick={() => confirmDelete(editingId)}
                    disabled={isPending || isDeleting}
                    className="min-w-[100px]"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Delete
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  onClick={handleCreateNew}
                  disabled={isPending || isDeleting}
                  className="min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      {editing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editing ? (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          Update Supplier
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Create Supplier
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Data Table Card */}
      {data.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-semibold">Supplier Records</CardTitle>
                <CardDescription className="mt-1.5">
                  Manage and view all supplier information
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm self-start sm:self-auto">
                {data.length} {data.length === 1 ? 'Supplier' : 'Suppliers'}
              </Badge>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6 pb-6 overflow-x-auto">
            <DataTable 
              columns={columns} 
              data={data} 
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              Are you sure you want to delete supplier <span className="font-mono font-semibold break-all">{supplierToDelete}</span>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}