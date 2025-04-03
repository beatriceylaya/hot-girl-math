'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CurrencyInput from 'react-currency-input-field';
const loanSchema = z.object({
  loanAmount: z.number().min(100, "Loan amount must be at least Php100"),
  interestRate: z.number().min(0.1, "Interest rate must be positive"),
  term: z.number().min(1, "Term must be at least 1"),
});

interface LoanResults {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

interface TermComparison {
  term: number;
  label: string;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

interface SavingsAlternative {
    annualRate: number;
    totalSaved: number;
    difference: number;
    monthsToReachLoan: number;
    reachedLoan: boolean;
  }

export default function HotGirlMathCalculator() {
  const [results, setResults] = useState<LoanResults | null>(null);
  const [termComparisons, setTermComparisons] = useState<TermComparison[]>([]);
  const [showSavings, setShowSavings] = useState<boolean>(false);
  const [savingsAlternatives, setSavingsAlternatives] = useState<SavingsAlternative[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanAmount: 1000,
      interestRate: 5,
      term: 12
    }
  });

  const calculateLoan = (data: z.infer<typeof loanSchema>) => {
    const { loanAmount, interestRate, term } = data;
    
    // Basic loan calculation
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                           (Math.pow(1 + monthlyRate, term) - 1);
    
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - loanAmount;

    // Term comparisons
    const comparisons = [
      { 
        term: Math.floor(term / 2), 
        label: 'Shorter Term' 
      },
      { 
        term: term * 2, 
        label: 'Longer Term' 
      }
    ].map(comparison => {
      const compMonthlyRate = interestRate / 100 / 12;
      const compMonthlyPayment = loanAmount * 
        (compMonthlyRate * Math.pow(1 + compMonthlyRate, comparison.term)) / 
        (Math.pow(1 + compMonthlyRate, comparison.term) - 1);
      
      const compTotalPayment = compMonthlyPayment * comparison.term;
      const compTotalInterest = compTotalPayment - loanAmount;

      return {
        ...comparison,
        monthlyPayment: compMonthlyPayment,
        totalPayment: compTotalPayment,
        totalInterest: compTotalInterest
      };
    });

    // Calculate savings alternatives
    const savingsRates = [2, 4, 6]; // 2-6% annual returns
    const savingsAlts = savingsRates.map(annualRate => {
      const monthlyRate = annualRate / 100 / 12;
      let totalSaved = 0;
      let monthsToReachLoan = 0;
      let reachedLoan = false;
      
      // Calculate compound interest savings
      for (let month = 1; month <= term; month++) {
        // Add monthly payment and calculate interest
        totalSaved = totalSaved * (1 + monthlyRate) + monthlyPayment;
        
        // Check if we've reached the loan amount
        if (!reachedLoan && totalSaved >= loanAmount) {
          monthsToReachLoan = month;
          reachedLoan = true;
        }
      }
      
      // Calculate difference
      const difference = totalSaved - totalPayment;
      
      return {
        annualRate,
        totalSaved,
        difference,
        monthsToReachLoan,
        reachedLoan
      };
    });

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest
    });

    setTermComparisons(comparisons);
    setSavingsAlternatives(savingsAlts);
    setShowSavings(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">
          Hot Girl Math 💁‍♀️💸
        </h1>

        {/* Calculation Explanation */}
        <div className="mb-6">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center text-pink-600 hover:text-pink-800 font-medium"
          >
            <span>{showExplanation ? '❌ Hide Explanation' : '👩‍🏫 How This Calculator Works'}</span>
          </button>

          {showExplanation && (
            <div className="mt-3 p-4 bg-pink-50 rounded-lg text-sm">
              <h3 className="font-bold text-pink-700 mb-2">Hot Girl Math: Behind The Numbers</h3>
              
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">The Monthly Payment: </span> 
                  Your loan payment is calculated based on the amount borrowed, interest rate, and loan term—spreading the cost over time with added interest.
                </p>
                
                <p>
                  <span className="font-semibold">Total Payment: </span>
                  The full amount you'll repay, which is your monthly payment multiplied by the number of months.
                </p>
                
                <p>
                  <span className="font-semibold">Total Interest: </span>
                  The extra cost of borrowing—calculated as the total amount repaid minus the original loan amount.
                </p>
                
                <p>
                  <span className="font-semibold">Term Comparisons: </span>
                  Shorter terms mean higher monthly payments but lower total interest. Longer terms lower monthly payments but increase total interest.
                </p>
                
                <p>
                  <span className="font-semibold">Savings Alternative: </span>
                  Instead of borrowing, see how saving the same amount could grow over time—often letting you reach your goal faster and with more money.
                </p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(calculateLoan)} className="space-y-6">
          {/* Loan Amount Input */}
          <div>
            <label className="block text-pink-700 font-semibold mb-2">
              Loan Amount (Php)
            </label>
            <Controller
              name="loanAmount"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  prefix="₱"
                  decimalsLimit={2}
                  onValueChange={(value) => field.onChange(Number(value))}
                  allowNegativeValue={false}
                  defaultValue={100}
                  className="w-full p-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              )}
            />
            {errors.loanAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.loanAmount.message}
              </p>
            )}
          </div>

          {/* Interest Rate Input */}
          <div>
            <label className="block text-pink-700 font-semibold mb-2">
              Interest Rate (%)
            </label>
            <Controller
              name="interestRate"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="0.1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full p-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              )}
            />
            {errors.interestRate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.interestRate.message}
              </p>
            )}
          </div>

          {/* Term Input */}
          <div>
            <label className="block text-pink-700 font-semibold mb-2">
              Loan Term (Months)
            </label>
            <Controller
              name="term"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full p-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              )}
            />
            {errors.term && (
              <p className="text-red-500 text-sm mt-1">
                {errors.term.message}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Calculate 💅
          </button>
        </form>

        {results && (
          <div className="mt-8 bg-pink-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Financial Breakdown</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Monthly Payment</h3>
                <CurrencyInput
                  id="monthly-payment"
                  name="monthly-payment"
                  value={results.monthlyPayment.toFixed(2)}
                  prefix="Php "
                  disabled
                  className="text-md font-bold bg-transparent border-none p-0"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Total Interest</h3>
                <CurrencyInput
                  id="total-interest"
                  name="total-interest"
                  value={results.totalInterest.toFixed(2)}
                  prefix="Php "
                  disabled
                  className="text-md font-bold bg-transparent border-none p-0"
                />
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Total Payment</h3>
                <CurrencyInput
                  id="total-payment"
                  name="total-payment"
                  value={results.totalPayment.toFixed(2)}
                  prefix="Php "
                  disabled
                  className="text-md font-bold bg-transparent border-none p-0"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-pink-600 mb-4">Term Comparisons</h3>
              <div className="space-y-4">
                {termComparisons.map((comp, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-4 rounded-lg shadow hover:bg-pink-50 transition duration-300"
                  >
                    <h4 className="font-semibold text-pink-600">{comp.label}</h4>
                    <p>Term: {comp.term} months</p>
                    <div className="flex items-center">
                      <span className="mr-2">Monthly Payment:</span>
                      <CurrencyInput
                        id={`monthly-payment-${index}`}
                        name={`monthly-payment-${index}`}
                        value={comp.monthlyPayment.toFixed(2)}
                        prefix="Php "
                        disabled
                        className="text-md bg-transparent border-none p-0"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">Total Interest:</span>
                      <CurrencyInput
                        id={`total-interest-${index}`}
                        name={`total-interest-${index}`}
                        value={comp.totalInterest.toFixed(2)}
                        prefix="Php "
                        disabled
                        className="text-md bg-transparent border-none p-0"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">Total Payment:</span>
                      <CurrencyInput
                        id={`total-payment-${index}`}
                        name={`total-payment-${index}`}
                        value={comp.totalPayment.toFixed(2)}
                        prefix="Php "
                        disabled
                        className="text-md bg-transparent border-none p-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

           <div className="mt-8">
             <div className="flex items-center mb-4">
               <h3 className="text-xl font-bold text-pink-600">Savings Alternative 💰</h3>
               <button 
                 onClick={() => setShowSavings(!showSavings)}
                 className="ml-2 text-pink-600 hover:text-pink-800"
               >
                 {showSavings ? '(hide)' : '(show)'}
               </button>
             </div>
             
             {showSavings && (
               <>
                 <div className="bg-white p-4 rounded-lg shadow mb-4">
                   <p className="text-pink-700 font-medium">
                     What if you saved the same amount as your monthly payment instead of taking a loan?
                   </p>
                 </div>
                 
                 <div className="space-y-4">
                   {savingsAlternatives.map((alt, index) => (
                     <div 
                       key={index} 
                       className="bg-white p-4 rounded-lg shadow hover:bg-pink-50 transition duration-300"
                     >
                       <h4 className="font-semibold text-pink-600">
                         Saving at {alt.annualRate}% Annual Return
                       </h4>
                       
                       <div className="grid md:grid-cols-2 gap-2 mt-2">
                         <div>
                           <p className="text-sm text-gray-600">Total Saved After Term</p>
                           <CurrencyInput
                             id={`savings-total-${index}`}
                             name={`savings-total-${index}`}
                             value={alt.totalSaved.toFixed(2)}
                             prefix="Php "
                             disabled
                             className="text-md bg-transparent border-none p-0"
                           />
                         </div>
                         
                         <div>
                           <p className="text-sm text-gray-600">Compared to Loan</p>
                           <CurrencyInput
                             id={`savings-difference-${index}`}
                             name={`savings-difference-${index}`}
                             value={alt.difference.toFixed(2)}
                             prefix="Php "
                             disabled
                             className={`text-md bg-transparent border-none p-0 ${alt.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}
                           />
                         </div>
                       </div>
                       
                       <div className="mt-2">
                         <p className="text-sm text-gray-600">Time to Reach Loan Amount</p>
                         <p className="font-medium">
                           {alt.reachedLoan 
                             ? `${alt.monthsToReachLoan} months` 
                             : 'Not reached during term'}
                         </p>
                       </div>
                       
                       {alt.reachedLoan && (
                         <div className="mt-2 text-sm text-green-600">
                           <p>You could have your money in {alt.monthsToReachLoan} months instead of paying for the full term!</p>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 <div className="bg-pink-100 p-4 rounded-lg mt-4">
                   <h4 className="font-semibold text-pink-700 mb-2">Hot Girl Savings Tip 💡</h4>
                   <p className="text-sm">
                     By saving the same amount as your loan payment each month, you could build wealth instead of paying interest. 
                     The higher the return rate on your savings, the more you benefit compared to taking a loan!
                   </p>
                 </div>
               </>
             )}
           </div>
          </div>
        )}
      </div>
    </div>
  );
}
