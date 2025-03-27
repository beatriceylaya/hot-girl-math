'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loanSchema = z.object({
  loanAmount: z.number().min(100, "Loan amount must be at least Php100"),
  interestRate: z.number().min(0.1, "Interest rate must be positive"),
  term: z.number().min(1, "Term must be at least 1"),
});

export default function HotGirlMathCalculator() {
  const [results, setResults] = useState<any>(null);
  const [termComparisons, setTermComparisons] = useState<any[]>([]);

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

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest
    });

    setTermComparisons(comparisons);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">
          Hot Girl Math 💁‍♀️💸
        </h1>

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
                <input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
            Calculate My Hot Girl Math 💅
          </button>
        </form>

        {results && (
          <div className="mt-8 bg-pink-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Financial Breakdown</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Monthly Payment</h3>
                <p className="text-md font-bold">Php {results.monthlyPayment.toFixed(2)}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Total Interest</h3>
                <p className="text-md font-bold">Php {results.totalInterest.toFixed(2)}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-pink-600 font-semibold">Total Payment</h3>
                <p className="text-md font-bold">Php {results.totalPayment.toFixed(2)}</p>
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
                    <p>Monthly Payment: Php {comp.monthlyPayment.toFixed(2)}</p>
                    <p>Total Interest: Php {comp.totalInterest.toFixed(2)}</p>
                    <p>Total Payment: Php {comp.totalPayment.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
