import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PurchasesPage } from '../pages/PurchasesPage';
import { TransfersPage } from '../pages/TransfersPage';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import { ExpendituresPage } from '../pages/ExpendituresPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { BaseManagementPage } from '../pages/BaseManagementPage';
import { EquipmentTypesPage } from '../pages/EquipmentTypesPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/expenditures" element={<ExpendituresPage />} />

        {/* ADMIN only operational sectors */}
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bases"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <BaseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-types"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EquipmentTypesPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
