import React, { useState } from 'react';
import { SAMPLE_QUIZ } from '../data/ciaData';
import { X, CheckCircle, AlertCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface InteractiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  isOpen,
  onClose,
  onOpenCheckout,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = SAMPLE_QUIZ[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setHasSubmitted(true);
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < SAMPLE_QUIZ.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-white border border-sky-100 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-50 via-white to-amber-50/50 border-b border-sky-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-[#b58b42] border border-amber-200">
                CIA® Exam Simulator
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {quizFinished ? 'Assessment Complete' : `Question ${currentQuestionIndex + 1} of ${SAMPLE_QUIZ.length}`}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              Certified Internal Auditor Knowledge Check
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 p-6 bg-white text-slate-900">
          {quizFinished ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#b58b42] flex items-center justify-center mx-auto ring-8 ring-amber-50/60 border border-amber-200">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  Score: <span className="text-[#b58b42]">{score}</span> / {SAMPLE_QUIZ.length} Correct
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {score === 3
                    ? 'Exceptional grasp of internal audit concepts! You are well-positioned for the full CIA® certification.'
                    : 'Good attempt! BNC Global’s 150+ hours of live mentoring will give you complete mastery over all IIA standards and exam traps.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 max-w-md mx-auto text-left text-xs space-y-1.5 text-slate-600">
                <div className="font-bold text-slate-900">How BNC Global prepares you for 100%:</div>
                <p>• 5,000+ realistic practice questions with detailed psychometric rationale</p>
                <p>• Section-wise mock tests simulating Pearson VUE timing and interface</p>
                <p>• Live doubt solving directly with veteran audit faculty</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCheckout();
                  }}
                  className="btn-reflection px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Join Next Prep Cohort
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#b58b42] mb-1">
                  <span>{currentQ.part}</span>
                  <span>·</span>
                  <span className="text-slate-500">{currentQ.domain}</span>
                </div>
                <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  let optionStyle = 'bg-slate-50/70 border-slate-200 hover:border-sky-300 text-slate-800';

                  if (selectedAnswer === idx && !hasSubmitted) {
                    optionStyle = 'bg-sky-50 border-sky-500 text-slate-900 ring-2 ring-sky-500/20';
                  }

                  if (hasSubmitted) {
                    if (idx === currentQ.correctIndex) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500';
                    } else if (selectedAnswer === idx && idx !== currentQ.correctIndex) {
                      optionStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center shrink-0 font-bold ${
                        selectedAnswer === idx && !hasSubmitted
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 pt-0.5 leading-normal">{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {hasSubmitted && (
                <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    {selectedAnswer === currentQ.correctIndex ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Correct Answer</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span className="text-rose-700">Incorrect Choice</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-400 font-medium">
                  Practice mode · No penalty for guesses
                </span>
                {!hasSubmitted ? (
                  <button
                    disabled={selectedAnswer === null}
                    onClick={handleSubmitAnswer}
                    className="btn-reflection px-5 py-2 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="btn-reflection inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                  >
                    <span>{currentQuestionIndex < SAMPLE_QUIZ.length - 1 ? 'Next Question' : 'See Results'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
