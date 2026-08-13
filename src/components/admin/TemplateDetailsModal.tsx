import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileCode2, Target, CheckCircle2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import type { TemplateConfig } from "@/config/templates.config";

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateConfig | null;
  usageCount: number;
  totalResumes: number;
}

export function TemplateDetailsModal({
  isOpen,
  onClose,
  template,
  usageCount,
  totalResumes,
}: TemplateDetailsModalProps) {
  if (!template) return null;

  const usagePercentage = totalResumes > 0 ? ((usageCount / totalResumes) * 100).toFixed(1) : "0.0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileCode2 className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold flex items-center gap-3">
                {template.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 font-mono text-xs mt-1">
                ID: {template.id} • Slug: {template.slug}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Details Column */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Category</span>
                  <div className="text-sm font-semibold text-white">{template.category}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">ATS Rating</span>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">{template.atsRating}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {template.description}
              </p>
            </div>

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Usage Stats */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Usage Statistics
              </h3>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Currently Used By</p>
                    <p className="text-2xl font-black text-white mt-1">{usageCount} <span className="text-sm font-normal text-slate-400">resumes</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Share of Total</p>
                    <p className="text-xl font-bold text-indigo-400 mt-1">{usagePercentage}%</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${Math.min(100, Number(usagePercentage))}%` }}
                  />
                </div>
                
                {usageCount === 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>This template is currently not used by any resumes.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Preview
            </h3>
            <div className="aspect-[1/1.4] w-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
              {template.previewImage ? (
                <img 
                  src={template.previewImage} 
                  alt={`${template.name} preview`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              
              <div className={`flex-col items-center justify-center space-y-3 p-6 text-center ${template.previewImage ? 'hidden' : 'flex'}`}>
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-700" />
                </div>
                <p className="text-sm font-medium text-slate-500">No preview image available</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
