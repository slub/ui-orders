export const integrationConfig = {
  id: 'e9b57fab-1850-44d4-8499-71fd15c845a0',
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      vendorId: 'f0b57fab-1850-44d4-8499-71fd15c845tb',
      configName: 'testConfig',
      ediConfig: {
        libEdiType: '014/EAN',
        vendorEdiType: '31B/US-SAN',
        defaultAcquisitionMethods: ['q8b57fab-llc5-c4d4-8499-71fd15c845tb'],
        accountNoList: ['12345'],
      },
      ediFtp: {
        ftpConnMode: 'Active',
        ftpFormat: 'SFTP',
        ftpMode: 'ASCII',
      },
      ediSchedule: {
        enableScheduledExport: true,
        scheduleParameters: {
          weekDays: ['MONDAY'],
        },
      },
    },
  },
};
