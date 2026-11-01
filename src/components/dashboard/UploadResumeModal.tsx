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

    setUploadState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

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
        className={`bg-card/95 backdrop-blur-2xl border-white/[0.1] text-foreground w-full rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl shadow-black/60 ${
          uploadState === "success" ? "max-w-4xl" : "max-w-md"
        }`} 
        aria-describedby="upload-dialog-description"
      >
        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          <DialogHeader className="text-left space-y-2 shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Upload Existing Resume
            </DialogTitle>
            <DialogDescription id="upload-dialog-description" className="text-xs sm:text-sm text-muted-foreground">
              Import your existing resume and let ResumeForge optimize it for ATS scoring.
            </DialogDescription>
          </DialogHeader>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-rose-400 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* IDLE State: Upload Area */}
          {!selectedFile && uploadState === "idle" && (
            <div
              className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer group
                ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-500/10 scale-[0.99]"
                    : "border-white/[0.12] bg-background/50 hover:border-cyan-500/40 hover:bg-card/50"
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
              
              <div className="w-14 h-14 mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              
              <h3 className="text-sm font-bold text-foreground mb-1 text-center">
                Drag & drop your resume here
              </h3>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Supported formats: PDF, DOCX (Max 5 MB)
              </p>
              
              <Button 
                type="button" 
                variant="outline" 
                className="h-10 px-6 rounded-xl bg-card border-white/[0.1] hover:bg-white/[0.06] text-foreground text-xs sm:text-sm font-semibold touch-manipulation min-h-[44px]"
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
            <div className="bg-background/80 border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-[250px]" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold font-mono">
                      {selectedFile.name.split('.').pop()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-2 shrink-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Remove selected file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* PROCESSING State */}
          {(uploadState === "uploading" || uploadState === "extracting") && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-white/[0.08] border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-foreground text-sm font-semibold">
                {uploadState === "uploading" ? "Uploading resume..." : "Extracting structured data..."}
              </p>
            </div>
          )}

          {/* SUCCESS State (Review UI) */}
          {uploadState === "success" && parsedData && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Resume Parsed Successfully</h3>
                    <p className="text-xs text-muted-foreground">Review the extracted sections before continuing to the editor.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Column */}
                <div className="space-y-3 bg-background/60 p-5 rounded-2xl border border-white/[0.08]">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Section Status</h4>
                  {Object.entries(parsedData.metadata.confidence).map(([key, score]) => {
                     const isWarning = score === "LOW" && parsedData.resumeData[key as keyof typeof parsedData.resumeData];
                     const isMissing = score === "LOW" && !parsedData.resumeData[key as keyof typeof parsedData.resumeData];
                     const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                     
                     if (isMissing) return null;
                     
                     return (
                       <div key={key} className="flex items-center gap-2.5 text-xs font-medium">
                         {isWarning ? (
                           <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                         ) : (
                           <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                         )}
                         <span className={isWarning ? "text-amber-300 font-semibold" : "text-foreground"}>
                           {title} {isWarning && "(check)"}
                         </span>
                       </div>
                     );
                  })}
                  
                  {parsedData.metadata.warnings.length > 0 && (
                     <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
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
                <div className="md:col-span-2 space-y-5">
                  {/* Personal Info */}
                  <div className="bg-background/60 rounded-2xl p-5 border border-white/[0.08] relative group">
                    <button className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Name</p>
                        <input
                           type="text"
                           value={parsedData.resumeData.personalInfo.fullName}
                           onChange={(e) => setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, personalInfo: { ...parsedData.resumeData.personalInfo, fullName: e.target.value } } })}
                           className="text-sm font-semibold text-foreground bg-transparent border-b border-white/[0.12] hover:border-cyan-500/50 focus:border-cyan-400 focus:outline-none w-full pb-1 transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Email</p>
                        <input
                           type="text"
                           value={parsedData.resumeData.personalInfo.email}
                           onChange={(e) => setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, personalInfo: { ...parsedData.resumeData.personalInfo, email: e.target.value } } })}
                           className="text-sm text-foreground bg-transparent border-b border-white/[0.12] hover:border-cyan-500/50 focus:border-cyan-400 focus:outline-none w-full pb-1 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  {parsedData.resumeData.experience && parsedData.resumeData.experience.length > 0 && (
                    <div className="bg-background/60 rounded-2xl p-5 border border-white/[0.08]">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Experience</h4>
                      <div className="space-y-4">
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
                              className="text-sm font-bold text-foreground bg-transparent border-b border-transparent hover:border-white/[0.1] focus:border-cyan-400 focus:outline-none w-full transition-colors mb-1"
                            />
                            <div className="flex items-center gap-2 text-xs text-cyan-400 mb-2">
                              <input
                                type="text"
                                value={exp.company}
                                onChange={(e) => {
                                   const newExp = [...parsedData.resumeData.experience!];
                                   newExp[i].company = e.target.value;
                                   setParsedData({ ...parsedData, resumeData: { ...parsedData.resumeData, experience: newExp } });
                                }}
                                className="bg-transparent border-b border-transparent hover:border-cyan-500/50 focus:border-cyan-400 focus:outline-none transition-colors font-medium"
                              />
                              <span className="text-muted-foreground/60">•</span>
                              <span className="text-muted-foreground font-mono">{exp.startDate || "Date"} {exp.endDate ? `- ${exp.endDate}` : ""}</span>
                            </div>
                            <ul className="space-y-1 mt-2">
                              {exp.responsibilities.map((resp, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1.5 shrink-0 w-1 h-1 rounded-full bg-cyan-400"></span>
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
                    <div className="bg-background/60 rounded-2xl p-5 border border-white/[0.08]">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {[...(parsedData.resumeData.skills?.programming || []), ...(parsedData.resumeData.skills?.other || [])].map((skill, i) => (
                           <span key={i} className="px-2.5 py-1 bg-card text-foreground font-medium text-xs rounded-lg border border-white/[0.08]">
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
              className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-card border-white/[0.08] hover:bg-white/[0.06] text-foreground min-h-[44px] disabled:opacity-50"
            >
              Cancel
            </Button>
            
            {uploadState !== "success" ? (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedFile || uploadState === "uploading" || uploadState === "extracting"}
                className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg shadow-cyan-500/20"
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
                className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold min-h-[44px] transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
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
