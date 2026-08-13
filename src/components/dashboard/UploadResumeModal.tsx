"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2, AlertTriangle, Edit2 } from "lucide-react";
import type { ResumeData } from "@/types/resume.types";
import type { ImportMetadata } from "@/lib/resume-import/parser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/resume.store";
import { generateUUID } from "@/utils/uuid";
import { DEFAULT_THEME, DEFAULT_SECTION_ORDER, Resume } from "@/types/resume.types";

interface UploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function UploadResumeModal({ isOpen, onClose }: UploadResumeModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "extracting" | "success">("idle");
  const [parsedData, setParsedData] = useState<{ resumeData: ResumeData; metadata: ImportMetadata } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setTemporaryImport = useResumeStore((s) => s.setTemporaryImport);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file) return "Please select a resume file.";
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      return "Please upload a PDF or DOCX resume.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Please upload a resume under 5 MB.";
    }
    return null;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setError(null);
    setUploadState("idle");
    setParsedData(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      setError("Please select a resume file.");
      return;
    }

    // Process State
    setUploadState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // We fake the "uploading -> extracting" state transition just to match the user's specific request
      // of showing "Uploading resume..." then "Extracting text...". Realistically it's one API call.
      setTimeout(() => {
        if (uploadState !== "success" && !error) {
           setUploadState("extracting");
        }
      }, 800); 

      const response = await fetch("/api/resume/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred during extraction.");
      }

      if (data.success && data.resumeData) {
        setParsedData({ resumeData: data.resumeData, metadata: data.metadata });
        setUploadState("success");
      } else {
        throw new Error("Failed to extract readable text.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process the document.");
      setUploadState("idle");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className={`bg-slate-900 border-slate-800 text-slate-100 w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col ${
          uploadState === "success" ? "max-w-4xl" : "max-w-md"
        }`} 
        aria-describedby="upload-dialog-description"
      >
        <div className={`p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar`}>
          <DialogHeader className="text-left space-y-2 shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
              Upload Existing Resume
            </DialogTitle>
            <DialogDescription id="upload-dialog-description" className="text-sm text-slate-400">
              Import your existing resume and continue editing it in ResumeForge.
            </DialogDescription>
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* IDLE State: Upload Area */}
          {!selectedFile && uploadState === "idle" && (
            <div
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors cursor-pointer group
                ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800/50"
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleButtonClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleButtonClick();
                }
              }}
              aria-label="File upload area. Drag and drop a file, or press Enter to select a file."
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleChange}
                aria-label="Upload resume file"
              />
              
              <div className="w-14 h-14 mb-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              
              <h3 className="text-sm font-semibold text-white mb-1 text-center">
                Drag & drop your resume here
              </h3>
              <p className="text-xs text-slate-400 text-center mb-4">
                Supported formats: PDF, DOCX (Max 5 MB)
              </p>
              
              <Button 
                type="button" 
                variant="outline" 
                className="h-10 px-6 rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white text-xs sm:text-sm font-medium touch-manipulation min-h-[44px]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick();
                }}
              >
                Choose File
              </Button>
            </div>
          )}
          
          {selectedFile && uploadState === "idle" && (
            /* FILE_SELECTED State */
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[250px]" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                      {selectedFile.name.split('.').pop()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-[11px] text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-2 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Remove selected file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* PROCESSING State */}
          {(uploadState === "uploading" || uploadState === "extracting") && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-300 font-medium">
                {uploadState === "uploading" ? "Uploading resume..." : "Extracting text..."}
              </p>
            </div>
          )}

          {/* SUCCESS State (Review UI) */}
          {uploadState === "success" && parsedData && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Resume Imported Successfully</h3>
                    <p className="text-sm">Please review the extracted information before continuing.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Column */}
                <div className="space-y-3 bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Section Status</h4>
                  {Object.entries(parsedData.metadata.confidence).map(([key, score]) => {
                     const isWarning = score === "LOW" && parsedData.resumeData[key as keyof typeof parsedData.resumeData];
                     const isMissing = score === "LOW" && !parsedData.resumeData[key as keyof typeof parsedData.resumeData];
                     const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                     
                     if (isMissing) return null; // Don't show missing optional sections
                     
                     return (
                       <div key={key} className="flex items-center gap-2.5 text-sm">
                         {isWarning ? (
                           <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                         ) : (
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                         )}
                         <span className={isWarning ? "text-amber-400 font-medium" : "text-slate-300"}>
                           {title} {isWarning && "needs review"}
                         </span>
                       </div>
                     );
                  })}
                  
                  {parsedData.metadata.warnings.length > 0 && (
                     <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                       {parsedData.metadata.warnings.map((w, i) => (
                         <p key={i} className="text-xs text-rose-400 flex items-start gap-1.5">
                           <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                           {w}
                         </p>
                       ))}
                     </div>
                  )}
                </div>

                {/* Preview Column */}
                <div className="md:col-span-2 space-y-6">
                  {/* Personal Info */}
                  <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 relative group">
                    <button className="absolute top-4 right-4 p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Name</p>
                        <input
                           type="text"
                           value={parsedData.resumeData.personalInfo.fullName}
                           onChange={(e) => setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, personalInfo: { ...parsedData.resumeData.personalInfo, fullName: e.target.value } } })}
                           className="text-sm font-medium text-white bg-transparent border-b border-slate-700 hover:border-slate-500 focus:border-indigo-500 focus:outline-none w-full pb-1 transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Email</p>
                        <input
                           type="text"
                           value={parsedData.resumeData.personalInfo.email}
                           onChange={(e) => setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, personalInfo: { ...parsedData.resumeData.personalInfo, email: e.target.value } } })}
                           className="text-sm text-slate-300 bg-transparent border-b border-slate-700 hover:border-slate-500 focus:border-indigo-500 focus:outline-none w-full pb-1 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  {parsedData.resumeData.experience && parsedData.resumeData.experience.length > 0 && (
                    <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Experience</h4>
                      <div className="space-y-5">
                        {parsedData.resumeData.experience.map((exp, i) => (
                          <div key={i} className="relative group">
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => {
                                 const newExp = [...parsedData.resumeData.experience!];
                                 newExp[i].position = e.target.value;
                                 setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, experience: newExp } });
                              }}
                              className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full transition-colors mb-1"
                            />
                            <div className="flex items-center gap-2 text-xs text-indigo-400 mb-2">
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                   const newExp = [...parsedData.resumeData.experience!];
                                   newExp[i].company = e.target.value;
                                   setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, experience: newExp } });
                                }}
                                className="bg-transparent border-b border-transparent hover:border-indigo-500/50 focus:border-indigo-500 focus:outline-none transition-colors"
                              />
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">{exp.startDate || "Date"} {exp.endDate ? `- ${exp.endDate}` : ""}</span>
                            </div>
                            <ul className="space-y-1.5 mt-2">
                              {exp.responsibilities.map((resp, j) => (
                                <li key={j} className="text-sm text-slate-300 flex items-start gap-2">
                                  <span className="text-slate-600 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-slate-600"></span>
                                  <span className="leading-relaxed">{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {(parsedData.resumeData.skills?.other || parsedData.resumeData.skills?.programming) && (
                    <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(parsedData.resumeData.skills?.programming || []), ...(parsedData.resumeData.skills?.other || [])].map((skill, i) => (
                           <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">
                             {skill}
                           </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadState === "uploading" || uploadState === "extracting"}
              className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-transparent border-slate-700 hover:bg-slate-800 text-slate-300 min-h-[44px] disabled:opacity-50"
            >
              Cancel
            </Button>
            
            {uploadState !== "success" ? (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedFile || uploadState === "uploading" || uploadState === "extracting"}
                className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (!parsedData) return;
                  const tempId = generateUUID();
                  const tempResume: Resume = {
                    id: tempId,
                    userId: "temp-user",
                    title: "Imported Resume",
                    slug: tempId,
                    templateId: "minimal-white",
                    data: parsedData.resumeData,
                    theme: DEFAULT_THEME,
                    sectionOrder: DEFAULT_SECTION_ORDER,
                    isPublic: false,
                    downloadCount: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isTemporary: true,
                  };
                  setTemporaryImport(tempResume);
                  router.push(`/editor/${tempId}`);
                }}
                className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold min-h-[44px] transition-transform active:scale-95"
              >
                Open in Resume Editor
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
