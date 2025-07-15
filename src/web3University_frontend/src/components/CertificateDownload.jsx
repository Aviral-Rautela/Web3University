import React, { useState } from 'react';
import { Download, Award, Calendar, User, CheckCircle, ExternalLink } from 'lucide-react';
import { web3University_backend } from 'declarations/web3University_backend';

const CertificateDownload = ({ certificates }) => {
  const [issuingCertificate, setIssuingCertificate] = useState(null);
  const [availableCertificates, setAvailableCertificates] = useState(certificates);

  const generateCertificate = async (courseId) => {
    setIssuingCertificate(courseId);
    
    try {
      const result = await web3University_backend.issue_certificate(courseId);
      if (result.Ok) {
        setAvailableCertificates(prev => [...prev, result.Ok]);
      } else {
        console.error('Failed to issue certificate:', result.Err);
      }
    } catch (error) {
      console.error('Failed to issue certificate:', error);
    } finally {
      setIssuingCertificate(null);
    }
  };

  const downloadCertificate = (certificate) => {
    // Create a simple certificate as HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 0; padding: 40px; background: #f8f9fa; }
          .certificate { max-width: 800px; margin: 0 auto; background: white; padding: 60px; border: 3px solid #3b82f6; border-radius: 10px; }
          .header { text-align: center; margin-bottom: 40px; }
          .title { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .subtitle { font-size: 18px; color: #64748b; }
          .content { text-align: center; margin: 40px 0; }
          .student-name { font-size: 28px; font-weight: bold; color: #1e40af; margin: 20px 0; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 5px; }
          .course-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
          .instructor { margin: 20px 0; }
          .date { margin: 20px 0; color: #64748b; }
          .hash { font-size: 12px; color: #9ca3af; margin-top: 40px; word-break: break-all; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-line { border-bottom: 1px solid #000; width: 200px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">Web3 University</div>
          </div>
          <div class="content">
            <p>This is to certify that</p>
            <div class="student-name">${certificate.student_name}</div>
            <p>has successfully completed the course</p>
            <div class="course-title">${certificate.course_title}</div>
            <div class="instructor">Instructor: ${certificate.instructor_name}</div>
            <div class="date">Date: ${new Date(Number(certificate.issued_at) / 1000000).toLocaleDateString()}</div>
          </div>
          <div class="signature">
            <div class="signature-line">
              <div style="margin-top: 10px;">Student</div>
            </div>
            <div class="signature-line">
              <div style="margin-top: 10px;">Instructor</div>
            </div>
          </div>
          <div class="hash">
            Certificate Hash: ${certificate.certificate_hash}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificate.course_title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Certificates</h2>
      </div>

      {availableCertificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-500">Complete courses to earn your certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableCertificates.map((certificate) => (
            <div key={certificate.certificate_hash} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-accent-100 rounded-full">
                      <Award className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Certificate of Completion</h3>
                      <p className="text-sm text-gray-600">{certificate.course_title}</p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Instructor: {certificate.instructor_name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Issued: {formatDate(certificate.issued_at)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-600">Certificate Hash:</p>
                  <p className="text-xs font-mono text-gray-800 break-all">
                    {certificate.certificate_hash}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(certificate.certificate_hash);
                    }}
                    className="btn btn-outline text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateDownload;